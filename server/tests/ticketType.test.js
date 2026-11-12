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

jest.setTimeout(25000);

describe('Ticket Management API (/api/events/:id/ticket-types & /api/ticket-types)', () => {
  const uniqueSuffix = Date.now();

  let owner;
  let outsider;
  let orgId;
  let eventId;
  let draftEventId;
  let ticketTypeId;

  const createdUserIds = [];
  const createdOrgIds = [];
  const createdEventIds = [];
  const createdTierIds = [];

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

    owner = await registerTestUser('Ticket Tier Owner', 'tt-owner');
    outsider = await registerTestUser('Ticket Tier Outsider', 'tt-outsider');

    // Create organization
    const orgRes = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: `Concert Org ${uniqueSuffix}`
      });
    orgId = orgRes.body.data.organization._id;
    createdOrgIds.push(orgId);

    // Create published event
    const eventRes = await request(app)
      .post(`/api/organizations/${orgId}/events`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: `Live Rock Concert ${uniqueSuffix}`,
        startsAt: '2026-12-20T19:00:00.000Z',
        endsAt: '2026-12-20T23:00:00.000Z'
      });
    eventId = eventRes.body.data.event._id;
    createdEventIds.push(eventId);

    // Publish event
    await request(app)
      .patch(`/api/events/${eventId}/publish`)
      .set('Authorization', `Bearer ${owner.token}`);

    // Create a draft event for 404 tests
    const draftRes = await request(app)
      .post(`/api/organizations/${orgId}/events`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        title: `Draft Concert ${uniqueSuffix}`,
        startsAt: '2026-12-22T19:00:00.000Z',
        endsAt: '2026-12-22T23:00:00.000Z'
      });
    draftEventId = draftRes.body.data.event._id;
    createdEventIds.push(draftEventId);
  });

  afterAll(async () => {
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

  describe('Ticket Tier Creation (POST /api/events/:id/ticket-types)', () => {
    it('should block unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/ticket-types`)
        .send({
          name: 'Early Bird',
          price: 49900,
          totalCapacity: 50
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject non-members with 403', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/ticket-types`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({
          name: 'Early Bird',
          price: 49900,
          totalCapacity: 50
        });

      expect(res.statusCode).toBe(403);
    });

    it('should validate capacity >= 1 and non-negative price with 400', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/ticket-types`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: 'Bad Tier',
          price: -100,
          totalCapacity: 0
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should allow organizer to create a ticket tier with 201', async () => {
      const res = await request(app)
        .post(`/api/events/${eventId}/ticket-types`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: 'Early Bird Pass',
          description: 'Access to general grounds',
          price: 49900, // ₹499
          totalCapacity: 50
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ticketType.name).toBe('Early Bird Pass');
      expect(res.body.data.ticketType.price).toBe(49900);
      expect(res.body.data.ticketType.totalCapacity).toBe(50);
      expect(res.body.data.ticketType.reservedCount).toBe(0);
      expect(res.body.data.ticketType.soldCount).toBe(0);

      ticketTypeId = res.body.data.ticketType._id;
      createdTierIds.push(ticketTypeId);
    });
  });

  describe('Ticket Tier Discovery (GET /api/events/:id/ticket-types)', () => {
    it('should allow public access to active ticket tiers of published event', async () => {
      const res = await request(app).get(`/api/events/${eventId}/ticket-types`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.ticketTypes)).toBe(true);
      const found = res.body.data.ticketTypes.find((t) => t._id === ticketTypeId);
      expect(found).toBeDefined();
      expect(found.availableCapacity).toBe(50);
    });

    it('should return 404 for public requesting ticket tiers of draft event', async () => {
      const res = await request(app).get(`/api/events/${draftEventId}/ticket-types`);
      expect(res.statusCode).toBe(404);
    });
  });

  describe('Ticket Tier Updates & Guardrails', () => {
    it('PATCH /api/ticket-types/:id should block outsider with 403', async () => {
      const res = await request(app)
        .patch(`/api/ticket-types/${ticketTypeId}`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({ name: 'Hacked Tier' });

      expect(res.statusCode).toBe(403);
    });

    it('PATCH /api/ticket-types/:id should allow organizer to update price and name', async () => {
      const res = await request(app)
        .patch(`/api/ticket-types/${ticketTypeId}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          name: 'Early Bird Pass (Phase 1)',
          price: 54900
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.ticketType.name).toBe('Early Bird Pass (Phase 1)');
      expect(res.body.data.ticketType.price).toBe(54900);
    });

    it('PATCH /api/ticket-types/:id should prevent reducing capacity below committed tickets', async () => {
      // Simulate 10 tickets committed in DB directly
      await TicketType.findByIdAndUpdate(ticketTypeId, { reservedCount: 5, soldCount: 5 });

      // Attempting to reduce capacity to 8 (< 10) must fail
      const res = await request(app)
        .patch(`/api/ticket-types/${ticketTypeId}`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          totalCapacity: 8
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cannot reduce total capacity');

      // Reset simulated counts
      await TicketType.findByIdAndUpdate(ticketTypeId, { reservedCount: 0, soldCount: 0 });
    });

    it('PATCH /api/ticket-types/:id/toggle should toggle active status', async () => {
      const resDeactivate = await request(app)
        .patch(`/api/ticket-types/${ticketTypeId}/toggle`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(resDeactivate.statusCode).toBe(200);
      expect(resDeactivate.body.data.ticketType.isActive).toBe(false);

      // Verify public cannot see deactivated tier
      const publicRes = await request(app).get(`/api/events/${eventId}/ticket-types`);
      const found = publicRes.body.data.ticketTypes.find((t) => t._id === ticketTypeId);
      expect(found).toBeUndefined();

      // Toggle back to active
      const resActivate = await request(app)
        .patch(`/api/ticket-types/${ticketTypeId}/toggle`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(resActivate.statusCode).toBe(200);
      expect(resActivate.body.data.ticketType.isActive).toBe(true);
    });
  });
});
