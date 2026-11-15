const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const crypto = require('crypto');
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
const Ticket = require('../src/models/ticket.model');
const { generateTicketsForBooking } = require('../src/services/ticket.service');

jest.setTimeout(35000);

describe('Digital Ticketing & Check-In Validation API (/api/tickets)', () => {
  const uniqueSuffix = Date.now();

  let organizer;
  let staff;
  let customer;
  let outsider;
  let orgId;
  let eventId;
  let ticketTier;
  let booking;
  let testTicket;

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

    organizer = await registerTestUser('Fest Organizer', 'tkt-org');
    staff = await registerTestUser('Gate Staff', 'tkt-staff');
    customer = await registerTestUser('Ticket Customer', 'tkt-cust');
    outsider = await registerTestUser('Outsider User', 'tkt-out');

    // Create organization
    const orgRes = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({ name: `Fest Org Tickets ${uniqueSuffix}` });
    orgId = orgRes.body.data.organization._id;
    createdOrgIds.push(orgId);

    // Add staff to organization
    await request(app)
      .post(`/api/organizations/${orgId}/members`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({ email: staff.user.email, role: 'staff' });

    // Create & publish event
    const eventRes = await request(app)
      .post(`/api/organizations/${orgId}/events`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({
        title: `Digital Ticketing Fest ${uniqueSuffix}`,
        startsAt: '2026-12-30T10:00:00.000Z',
        endsAt: '2026-12-30T18:00:00.000Z'
      });
    eventId = eventRes.body.data.event._id;
    createdEventIds.push(eventId);

    await request(app)
      .patch(`/api/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${organizer.token}`);

    // Create ticket tier
    const tierRes = await request(app)
      .post(`/api/events/${eventId}/ticket-types`)
      .set('Authorization', `Bearer ${organizer.token}`)
      .send({
        name: 'VIP Pass',
        price: 99900,
        totalCapacity: 50
      });
    ticketTier = tierRes.body.data.ticketType._id;
    createdTierIds.push(ticketTier);

    // Create booking hold
    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customer.token}`)
      .send({
        eventId,
        items: [{ ticketTypeId: ticketTier, quantity: 2 }]
      });
    booking = bookRes.body.data.booking;
    createdBookingIds.push(booking._id);

    // Simulate confirmed booking and generate tickets
    booking.status = 'CONFIRMED';
    const tickets = await generateTicketsForBooking(booking);
    testTicket = tickets[0];
  });

  afterAll(async () => {
    if (createdBookingIds.length > 0) {
      await Ticket.deleteMany({ booking: { $in: createdBookingIds } });
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

  describe('Customer Ticket Access (GET /api/tickets/my & GET /api/tickets/:id)', () => {
    it('GET /api/tickets/my should return customer tickets with signed QR tokens', async () => {
      const res = await request(app)
        .get('/api/tickets/my')
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.tickets)).toBe(true);
      expect(res.body.data.tickets.length).toBe(2);

      const t = res.body.data.tickets[0];
      expect(t.ticketNumber).toContain('TKT-');
      expect(t.status).toBe('VALID');
      expect(t.qrToken).toBeDefined();
    });

    it('GET /api/tickets/:id should return single ticket details to customer', async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicket._id}`)
        .set('Authorization', `Bearer ${customer.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.ticket._id).toBe(testTicket._id.toString());
      expect(res.body.data.ticket.tierName).toBe('VIP Pass');
    });

    it('GET /api/tickets/:id should reject outsider with 403', async () => {
      const res = await request(app)
        .get(`/api/tickets/${testTicket._id}`)
        .set('Authorization', `Bearer ${outsider.token}`);

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Check-In Validation & Single-Use Enforcement (POST /api/tickets/checkin)', () => {
    it('should reject forged or corrupted QR tokens with 400', async () => {
      const res = await request(app)
        .post('/api/tickets/checkin')
        .set('Authorization', `Bearer ${staff.token}`)
        .send({ qrToken: 'forged_fake_token_base64_string_12345' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Invalid or corrupted QR token');
    });

    it('should block outsider scanner with 403', async () => {
      const res = await request(app)
        .post('/api/tickets/checkin')
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({ qrToken: testTicket.qrToken });

      expect(res.statusCode).toBe(403);
      expect(res.body.message).toContain('not authorized to check in tickets');
    });

    it('should allow authorized staff to check in a valid ticket with 200', async () => {
      const res = await request(app)
        .post('/api/tickets/checkin')
        .set('Authorization', `Bearer ${staff.token}`)
        .send({ qrToken: testTicket.qrToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticket.status).toBe('USED');
      expect(res.body.data.ticket.usedAt).toBeDefined();
      expect(res.body.data.ticket.checkedInBy).toBe(staff.user.id);

      // Verify DB record
      const dbTicket = await Ticket.findById(testTicket._id);
      expect(dbTicket.status).toBe('USED');
    });

    it('CRITICAL: Scanning the same ticket a second time must be rejected with 409 (Single-Use Enforcement)', async () => {
      // Re-scan the same ticket that was just used above!
      const res = await request(app)
        .post('/api/tickets/checkin')
        .set('Authorization', `Bearer ${staff.token}`)
        .send({ qrToken: testTicket.qrToken });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toContain('ALREADY been used');
    });
  });

  describe('Organizer Ticket Management (GET /api/events/:id/tickets)', () => {
    it('should allow organizer to list all tickets for an event with attendance status', async () => {
      const res = await request(app)
        .get(`/api/events/${eventId}/tickets`)
        .set('Authorization', `Bearer ${organizer.token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data.tickets)).toBe(true);
      expect(res.body.data.tickets.length).toBe(2);

      const usedCount = res.body.data.tickets.filter((t) => t.status === 'USED').length;
      expect(usedCount).toBe(1); // One was checked in above!
    });
  });
});
