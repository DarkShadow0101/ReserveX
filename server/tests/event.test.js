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

jest.setTimeout(25000);

describe('Event Management API (/api/events & /api/organizations/:id/events)', () => {
  const uniqueSuffix = Date.now();

  let owner;
  let staff;
  let outsider;
  let organizationId;
  let draftEventId;
  let publishedEventId;

  const createdUserIds = [];
  const createdOrgIds = [];
  const createdEventIds = [];

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

    owner = await registerTestUser('Org Owner', 'evt-owner');
    staff = await registerTestUser('Org Staff', 'evt-staff');
    outsider = await registerTestUser('Outsider User', 'evt-outsider');

    // Create an organization for testing
    const orgRes = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        name: `Tech Fest Org ${uniqueSuffix}`,
        description: 'Tech fest team'
      });

    organizationId = orgRes.body.data.organization._id;
    createdOrgIds.push(organizationId);

    // Add staff member to the organization
    await request(app)
      .post(`/api/organizations/${organizationId}/members`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({
        email: staff.user.email,
        role: 'staff'
      });
  });

  afterAll(async () => {
    // Scoped cleanup
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

  describe('Event Creation (POST /api/organizations/:id/events)', () => {
    it('should block unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post(`/api/organizations/${organizationId}/events`)
        .send({
          title: 'Hackathon 2026',
          startsAt: '2026-12-01T10:00:00.000Z',
          endsAt: '2026-12-01T18:00:00.000Z'
        });

      expect(res.statusCode).toBe(401);
    });

    it('should reject non-member with 403', async () => {
      const res = await request(app)
        .post(`/api/organizations/${organizationId}/events`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({
          title: 'Hackathon 2026',
          startsAt: '2026-12-01T10:00:00.000Z',
          endsAt: '2026-12-01T18:00:00.000Z'
        });

      expect(res.statusCode).toBe(403);
    });

    it('should reject invalid date range where endsAt is before startsAt with 400', async () => {
      const res = await request(app)
        .post(`/api/organizations/${organizationId}/events`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          title: 'Hackathon 2026',
          startsAt: '2026-12-02T10:00:00.000Z',
          endsAt: '2026-12-01T10:00:00.000Z'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      const endsAtError = res.body.details.find((d) => d.field === 'endsAt');
      expect(endsAtError).toBeDefined();
      expect(endsAtError.message).toContain('endsAt must be after startsAt');
    });

    it('should allow owner to create a draft event with 201', async () => {
      const res = await request(app)
        .post(`/api/organizations/${organizationId}/events`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({
          title: `Annual Hackathon ${uniqueSuffix}`,
          description: '48-hour student hackathon',
          venue: 'Auditorium Hall A',
          startsAt: '2026-12-10T09:00:00.000Z',
          endsAt: '2026-12-12T17:00:00.000Z'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.event).toHaveProperty('_id');
      expect(res.body.data.event.status).toBe('draft');
      expect(res.body.data.event.title).toBe(`Annual Hackathon ${uniqueSuffix}`);

      draftEventId = res.body.data.event._id;
      createdEventIds.push(draftEventId);
    });

    it('should allow staff to create another draft event with 201', async () => {
      const res = await request(app)
        .post(`/api/organizations/${organizationId}/events`)
        .set('Authorization', `Bearer ${staff.token}`)
        .send({
          title: `Robotics Workshop ${uniqueSuffix}`,
          description: 'Hands-on robotics sessions',
          venue: 'Lab 4',
          startsAt: '2026-12-15T10:00:00.000Z',
          endsAt: '2026-12-15T16:00:00.000Z'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.event.status).toBe('draft');

      publishedEventId = res.body.data.event._id;
      createdEventIds.push(publishedEventId);
    });
  });

  describe('Organizer Event Management & Updates', () => {
    it('GET /api/organizations/:id/events should list all org events for staff/owner', async () => {
      const res = await request(app)
        .get(`/api/organizations/${organizationId}/events`)
        .set('Authorization', `Bearer ${staff.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.events)).toBe(true);
      expect(res.body.data.events.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/events/:id/manage should return full details for organizer', async () => {
      const res = await request(app)
        .get(`/api/events/${draftEventId}/manage`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.event._id).toBe(draftEventId);
      expect(res.body.data.myRole).toBe('owner');
    });

    it('PATCH /api/events/:id should block outsider with 403', async () => {
      const res = await request(app)
        .patch(`/api/events/${draftEventId}`)
        .set('Authorization', `Bearer ${outsider.token}`)
        .send({ title: 'Hacked Title' });

      expect(res.statusCode).toBe(403);
    });

    it('PATCH /api/events/:id should allow organizer to update details', async () => {
      const res = await request(app)
        .patch(`/api/events/${draftEventId}`)
        .set('Authorization', `Bearer ${staff.token}`)
        .send({
          venue: 'Auditorium Hall B (Updated)'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.event.venue).toBe('Auditorium Hall B (Updated)');
    });

    it('PATCH /api/events/:id/publish should publish the event', async () => {
      const res = await request(app)
        .patch(`/api/events/${publishedEventId}/publish`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.event.status).toBe('published');
    });
  });

  describe('Public Event Discovery (/api/events)', () => {
    it('GET /api/events should list published events, but omit drafts', async () => {
      const res = await request(app).get('/api/events');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      const returnedIds = res.body.data.events.map((e) => e._id);

      expect(returnedIds).toContain(publishedEventId);
      expect(returnedIds).not.toContain(draftEventId);
    });

    it('GET /api/events/:id should return 404 for draft event', async () => {
      const res = await request(app).get(`/api/events/${draftEventId}`);
      expect(res.statusCode).toBe(404);
    });

    it('GET /api/events/:id should return 200 with populated organization for published event', async () => {
      const res = await request(app).get(`/api/events/${publishedEventId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.event._id).toBe(publishedEventId);
      expect(res.body.data.event.status).toBe('published');
      expect(res.body.data.event.organization).toHaveProperty('name');
      expect(res.body.data.event.organization).toHaveProperty('slug');
    });
  });

  describe('Event Cancellation', () => {
    it('PATCH /api/events/:id/cancel should cancel the event and block republishing', async () => {
      const cancelRes = await request(app)
        .patch(`/api/events/${publishedEventId}/cancel`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(cancelRes.statusCode).toBe(200);
      expect(cancelRes.body.data.event.status).toBe('cancelled');

      // Attempting to publish cancelled event should fail
      const publishRes = await request(app)
        .patch(`/api/events/${publishedEventId}/publish`)
        .set('Authorization', `Bearer ${owner.token}`);

      expect(publishRes.statusCode).toBe(400);
      expect(publishRes.body.message).toContain('Cannot publish a cancelled event');
    });
  });
});
