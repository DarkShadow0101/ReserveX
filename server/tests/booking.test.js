const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Organization = require('../src/models/organization.model');
const Membership = require('../src/models/membership.model');
const Event = require('../src/models/event.model');
const TicketType = require('../src/models/ticketType.model');
const Booking = require('../src/models/booking.model');
const { cleanupExpiredHolds } = require('../src/services/booking.service');

jest.setTimeout(35000);

describe('Booking Engine & Concurrency Safety API (/api/bookings)', () => {
  const uniqueSuffix = Date.now();

  let organizer;
  let customerA;
  let customerB;
  let eventId;
  let ticketTier50;
  let limitedTier3;
  let pendingBookingId;

  const createdUserIds = [];
  const createdOrgIds = [];
  const createdEventIds = [];
  const createdTierIds = [];
  const createdBookingIds = [];

  async function registerTestUser(name, prefix) {
    const res = await request(app).post('/api/auth/register').send({
      fullName: name,
      email: `${prefix}-${uniqueSuffix}@reservex.local`,
      password: 'StrongPassword123'
    });
    createdUserIds.push(res.body.user.id);
    return {
      user: res.body.user,
      token: res.body.token
    };
  }

  beforeAll(async () => {
    await connectDB();

    organizer = await registerTestUser('Fest Organizer', 'bk-org');
    customerA = await registerTestUser('Customer Alice', 'bk-alice');
    customerB = await registerTestUser('Customer Bob', 'bk-bob');

    // Create organization
    const orgRes = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({ name: `Fest Org ${uniqueSuffix}` });
    const orgId = orgRes.body.data.organization._id;
    createdOrgIds.push(orgId);

    // Create and publish event (starts 10 days in future)
    const eventRes = await request(app)
      .post(`/api/organizations/${orgId}/events`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({
        title: `Tech Fest 2026 ${uniqueSuffix}`,
        startsAt: '2026-12-25T10:00:00.000Z',
        endsAt: '2026-12-25T18:00:00.000Z'
      });
    eventId = eventRes.body.data.event._id;
    createdEventIds.push(eventId);

    await request(app)
      .patch(`/api/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${organizer.token}`);

    // Create tier 1: Standard capacity 50
    const tierRes1 = await request(app)
      .post(`/api/events/${eventId}/ticket-types`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({
        name: 'General Admission',
        price: 29900,
        totalCapacity: 50
      });
    ticketTier50 = tierRes1.body.data.ticketType._id;
    createdTierIds.push(ticketTier50);

    // Create tier 2: Strictly limited capacity 3 (for concurrency testing)
    const tierRes2 = await request(app)
      .post(`/api/events/${eventId}/ticket-types`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({
        name: 'VIP Front Row',
        price: 99900,
        totalCapacity: 3
      });
    limitedTier3 = tierRes2.body.data.ticketType._id;
    createdTierIds.push(limitedTier3);
  });

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await Booking.deleteMany({ _id: { $in: createdBookingIds } });
    }
    if (createdTierIds.length > 0) {
      await TicketType.deleteMany({ _id: { $in: createdTierIds } });
    }
    if (createdEventIds.length > 0) {
      await Event.deleteMany({ _id: { $in: createdEventIds } });
    }
    if (createdOrgIds.length > 0) {
      await Membership.deleteMany({ organization: { $in: createdOrgIds } });
      await Organization.deleteMany({ _id: { $in: createdOrgIds } });
    }
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    await mongoose.connection.close();
  });

  describe('Booking Creation & Inventory Holds (POST /api/bookings)', () => {
    it('should block unauthenticated booking with 401', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .send({
          eventId,
          items: [{ ticketTypeId: ticketTier50, quantity: 2 }]
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject booking with 0 or negative quantity with 400', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerA.token}`)
        .send({
          eventId,
          items: [{ ticketTypeId: ticketTier50, quantity: 0 }]
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should create temporary booking hold and increment reservedCount with 201', async () => {
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerA.token}`)
        .send({
          eventId,
          items: [{ ticketTypeId: ticketTier50, quantity: 2 }]
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.booking.status).toBe('PENDING_PAYMENT');
      expect(res.body.data.booking.bookingReference).toContain('BK-');
      expect(res.body.data.booking.totalAmount).toBe(29900 * 2);
      expect(res.body.data.booking.holdExpiresAt).toBeDefined();

      pendingBookingId = res.body.data.booking._id;
      createdBookingIds.push(pendingBookingId);

      // Verify DB: reservedCount must be 2, soldCount 0
      const tier = await TicketType.findById(ticketTier50);
      expect(tier.reservedCount).toBe(2);
      expect(tier.availableCapacity).toBe(48);
    });
  });

  describe('Customer Cancel Hold (POST /api/bookings/:id/cancel)', () => {
    it('should release inventory hold when customer cancels pending booking', async () => {
      const cancelRes = await request(app)
        .post(`/api/bookings/${pendingBookingId}/cancel`)
        .set('Authorization', `Bearer ${customerA.token}`);

      expect(cancelRes.statusCode).toBe(200);
      expect(cancelRes.body.data.booking.status).toBe('CANCELLED');

      // Verify DB: reservedCount must be released back to 0!
      const tier = await TicketType.findById(ticketTier50);
      expect(tier.reservedCount).toBe(0);
      expect(tier.availableCapacity).toBe(50);
    });

    it('should prevent outsider from cancelling another customer booking with 403', async () => {
      // Create new hold by Alice
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerA.token}`)
        .send({
          eventId,
          items: [{ ticketTypeId: ticketTier50, quantity: 1 }]
        });
      const aliceBookingId = res.body.data.booking._id;
      createdBookingIds.push(aliceBookingId);

      // Bob tries to cancel Alice's booking
      const cancelRes = await request(app)
        .post(`/api/bookings/${aliceBookingId}/cancel`)
        .set('Authorization', `Bearer ${customerB.token}`);

      expect(cancelRes.statusCode).toBe(403);
    });
  });

  describe('CONCURRENCY TEST: Zero-Overselling Under High Parallel Load', () => {
    it('should allow exactly 3 parallel bookings for a 3-ticket tier and reject all others', async () => {
      // limitedTier3 has totalCapacity: 3
      // We will fire 8 concurrent requests simultaneously using Promise.all!
      const concurrentRequests = Array.from({ length: 8 }).map((_, i) =>
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${customerB.token}`)
          .send({
            eventId,
            items: [{ ticketTypeId: limitedTier3, quantity: 1 }]
          })
      );

      const responses = await Promise.all(concurrentRequests);

      const successful = responses.filter((r) => r.statusCode === 201);
      const rejected = responses.filter((r) => r.statusCode === 400);

      // Save created bookings for afterAll cleanup
      successful.forEach((r) => createdBookingIds.push(r.body.data.booking._id));

      // CRITICAL ASSERTIONS:
      // Exactly 3 succeed, exactly 5 fail
      expect(successful.length).toBe(3);
      expect(rejected.length).toBe(5);

      rejected.forEach((r) => {
        expect(r.body.message).toContain('Insufficient tickets available');
      });

      // Verify the database: totalCapacity = 3, reservedCount = 3, available = 0
      const tier = await TicketType.findById(limitedTier3);
      expect(tier.reservedCount).toBe(3);
      expect(tier.availableCapacity).toBe(0);

      // Even a subsequent single request must be rejected immediately
      const postCheck = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerA.token}`)
        .send({
          eventId,
          items: [{ ticketTypeId: limitedTier3, quantity: 1 }]
        });
      expect(postCheck.statusCode).toBe(400);
      expect(postCheck.body.message).toContain('Insufficient tickets available');
    });
  });

  describe('Background Hold Expiry Job', () => {
    it('should clean up expired holds and restore available inventory', async () => {
      // 1. Create a booking on ticketTier50 (holds 5 tickets)
      const res = await request(app)
        .post('/api/bookings')
        .set('Authorization', `Bearer ${customerA.token}`)
        .send({
          eventId,
          items: [{ ticketTypeId: ticketTier50, quantity: 5 }]
        });
      const holdBookingId = res.body.data.booking._id;
      createdBookingIds.push(holdBookingId);

      const tierBefore = await TicketType.findById(ticketTier50);
      expect(tierBefore.reservedCount).toBe(6); // 1 active from earlier + 5 new = 6

      // 2. Artificially backdate holdExpiresAt to 5 minutes in the past
      await Booking.findByIdAndUpdate(holdBookingId, {
        holdExpiresAt: new Date(Date.now() - 5 * 60 * 1000)
      });

      // 3. Trigger hold cleanup job directly
      const result = await cleanupExpiredHolds();
      expect(result.expiredCount).toBeGreaterThanOrEqual(1);

      // 4. Verify booking transitioned to EXPIRED
      const expiredBooking = await Booking.findById(holdBookingId);
      expect(expiredBooking.status).toBe('EXPIRED');

      // 5. Verify reservedCount was restored (5 tickets released back)
      const tierAfter = await TicketType.findById(ticketTier50);
      expect(tierAfter.reservedCount).toBe(1);
    });
  });

  describe('Customer & Organizer Views', () => {
    it('GET /api/bookings/my should list customer bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/my')
        .set('Authorization', `Bearer ${customerA.token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
      expect(res.body.data.bookings.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /api/events/:id/bookings should allow organizer to view all event bookings', async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/bookings`)
        .set('Authorization', `Bearer ${organizer.token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.bookings)).toBe(true);
      expect(res.body.data.bookings.length).toBeGreaterThanOrEqual(1);
    });
  });
});
