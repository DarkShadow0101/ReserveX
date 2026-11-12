const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');
const Organization = require('../src/models/organization.model');
const Membership = require('../src/models/membership.model');

jest.setTimeout(25000);

describe('Organizations & Multi-Tenancy API (/api/organizations)', () => {
  const uniqueSuffix = Date.now();

  let ownerA;
  let staffB;
  let outsiderOwnerC;
  let orgAId;
  let orgCId;

  const createdUserIds = [];
  const createdOrgIds = [];

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
    ownerA = await registerTestUser('Owner Alice', 'org-owner-a');
    staffB = await registerTestUser('Staff Bob', 'org-staff-b');
    outsiderOwnerC = await registerTestUser('Outsider Charlie', 'org-outsider-c');
  });

  afterAll(async () => {
    // Scoped cleanup: only remove test organizations, memberships, and users from this run
    if (createdOrgIds.length > 0) {
      await Membership.deleteMany({ organization: { $in: createdOrgIds } });
      await Organization.deleteMany({ _id: { $in: createdOrgIds } });
    }
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    await mongoose.connection.close();
  });

  it('should block unauthenticated organization creation with 401', async () => {
    const res = await request(app).post('/api/organizations').send({
      name: 'Unauthorized Fest'
    });

    expect(res.statusCode).toBe(401);
  });

  it('POST /api/organizations should create Org A and assign creator as owner', async () => {
    const res = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${ownerA.token}`)
      .send({
        name: `Coding Club ${uniqueSuffix}`,
        description: 'Annual college hackathon organizers'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organization).toHaveProperty('_id');
    expect(res.body.data.organization.slug).toContain('coding-club');

    orgAId = res.body.data.organization._id;
    createdOrgIds.push(orgAId);
  });

  it('GET /api/organizations/me should list creator organizations with owner role', async () => {
    const res = await request(app)
      .get('/api/organizations/me')
      .set('Authorization', `Bearer ${ownerA.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    const found = res.body.data.organizations.find((o) => o.organization._id === orgAId);
    expect(found).toBeDefined();
    expect(found.role).toBe('owner');
  });

  it('POST /api/organizations/:id/members should allow owner to add Staff Bob', async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgAId}/members`)
      .set('Authorization', `Bearer ${ownerA.token}`)
      .send({
        email: staffB.user.email,
        role: 'staff'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.member.role).toBe('staff');
  });

  it('should reject duplicate membership with 409', async () => {
    const res = await request(app)
      .post(`/api/organizations/${orgAId}/members`)
      .set('Authorization', `Bearer ${ownerA.token}`)
      .send({
        email: staffB.user.email,
        role: 'staff'
      });

    expect(res.statusCode).toBe(409);
  });

  it('should allow staff to read org details and members, but reject adding members with 403', async () => {
    const detailsRes = await request(app)
      .get(`/api/organizations/${orgAId}`)
      .set('Authorization', `Bearer ${staffB.token}`);
    expect(detailsRes.statusCode).toBe(200);
    expect(detailsRes.body.data.myRole).toBe('staff');

    const membersRes = await request(app)
      .get(`/api/organizations/${orgAId}/members`)
      .set('Authorization', `Bearer ${staffB.token}`);
    expect(membersRes.statusCode).toBe(200);
    expect(membersRes.body.data.members.length).toBe(2);

    const addRes = await request(app)
      .post(`/api/organizations/${orgAId}/members`)
      .set('Authorization', `Bearer ${staffB.token}`)
      .send({
        email: outsiderOwnerC.user.email,
        role: 'staff'
      });
    expect(addRes.statusCode).toBe(403);
  });

  it('should enforce cross-organization isolation (owner of Org C gets 403 on Org A)', async () => {
    const createC = await request(app)
      .post('/api/organizations')
      .set('Authorization', `Bearer ${outsiderOwnerC.token}`)
      .send({ name: `Music Club ${uniqueSuffix}` });

    orgCId = createC.body.data.organization._id;
    createdOrgIds.push(orgCId);

    const viewOrgA = await request(app)
      .get(`/api/organizations/${orgAId}`)
      .set('Authorization', `Bearer ${outsiderOwnerC.token}`);
    expect(viewOrgA.statusCode).toBe(403);

    const tamperOrgA = await request(app)
      .post(`/api/organizations/${orgAId}/members`)
      .set('Authorization', `Bearer ${outsiderOwnerC.token}`)
      .send({ email: outsiderOwnerC.user.email, role: 'owner' });
    expect(tamperOrgA.statusCode).toBe(403);
  });

  it('should prevent removing the last owner, while allowing removing staff', async () => {
    const removeOwnerRes = await request(app)
      .delete(`/api/organizations/${orgAId}/members/${ownerA.user.id}`)
      .set('Authorization', `Bearer ${ownerA.token}`);
    expect(removeOwnerRes.statusCode).toBe(400);

    const removeStaffRes = await request(app)
      .delete(`/api/organizations/${orgAId}/members/${staffB.user.id}`)
      .set('Authorization', `Bearer ${ownerA.token}`);
    expect(removeStaffRes.statusCode).toBe(200);
  });

  describe('Concurrency & Race Condition Protections', () => {
    it('Edge Case A: Concurrent duplicate addMember requests should result in exactly one 201 and one 409', async () => {
      const candidateUser = await registerTestUser('Candidate Dave', 'org-dave');

      // Fire 2 simultaneous requests to add Dave to Org A
      const [res1, res2] = await Promise.all([
        request(app)
          .post(`/api/organizations/${orgAId}/members`)
          .set('Authorization', `Bearer ${ownerA.token}`)
          .send({ email: candidateUser.user.email, role: 'staff' }),
        request(app)
          .post(`/api/organizations/${orgAId}/members`)
          .set('Authorization', `Bearer ${ownerA.token}`)
          .send({ email: candidateUser.user.email, role: 'staff' })
      ]);

      const statusCodes = [res1.statusCode, res2.statusCode].sort();
      expect(statusCodes).toEqual([201, 409]);

      const conflictRes = res1.statusCode === 409 ? res1 : res2;
      expect(conflictRes.body.message).toContain('already a member');

      // Verify only one membership document exists in DB
      const memberships = await Membership.find({
        user: candidateUser.user.id,
        organization: orgAId
      });
      expect(memberships.length).toBe(1);
    });

    it('Edge Case B: Concurrent owner removals must never orphan an org (only one owner can be removed)', async () => {
      // 1. Add a second owner to Org A (so Org A now has 2 owners: ownerA and coOwner)
      const coOwner = await registerTestUser('Co-Owner Eve', 'org-eve');
      const addOwnerRes = await request(app)
        .post(`/api/organizations/${orgAId}/members`)
        .set('Authorization', `Bearer ${ownerA.token}`)
        .send({ email: coOwner.user.email, role: 'owner' });
      expect(addOwnerRes.statusCode).toBe(201);

      // Verify organization has 2 owners
      const ownersBefore = await Membership.find({ organization: orgAId, role: 'owner' });
      expect(ownersBefore.length).toBe(2);

      // 2. Fire two simultaneous delete requests to remove BOTH owners at once
      const [delRes1, delRes2] = await Promise.all([
        request(app)
          .delete(`/api/organizations/${orgAId}/members/${ownerA.user.id}`)
          .set('Authorization', `Bearer ${coOwner.token}`),
        request(app)
          .delete(`/api/organizations/${orgAId}/members/${coOwner.user.id}`)
          .set('Authorization', `Bearer ${ownerA.token}`)
      ]);

      const statusCodes = [delRes1.statusCode, delRes2.statusCode].sort();
      // Exactly one succeeds (200) and one is rejected (400)
      expect(statusCodes).toEqual([200, 400]);

      const failedRes = delRes1.statusCode === 400 ? delRes1 : delRes2;
      expect(failedRes.body.message).toContain('Cannot remove the last owner of an organization');

      // 3. Critically verify: exactly 1 owner still exists in the database
      const ownersAfter = await Membership.find({ organization: orgAId, role: 'owner' });
      expect(ownersAfter.length).toBe(1);
    });
  });
});
