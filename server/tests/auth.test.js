const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env'), quiet: true });

const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/user.model');

jest.setTimeout(20000);

describe('Auth API (/api/auth)', () => {
  const uniqueSuffix = Date.now();
  const testUser = {
    fullName: 'Auth Test Student',
    email: `auth-test-${uniqueSuffix}@reservex.local`,
    password: 'StrongPassword123'
  };

  const createdUserIds = [];
  let authToken;

  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    // Only delete users created by THIS test run (never wipe existing DB users)
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should reject empty body with 400 Zod validation errors', async () => {
      const res = await request(app).post('/api/auth/register').send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(Array.isArray(res.body.details)).toBe(true);
    });

    it('should reject invalid email and short password', async () => {
      const res = await request(app).post('/api/auth/register').send({
        fullName: 'Test',
        email: 'not-an-email',
        password: '123'
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      const fields = res.body.details.map((d) => d.field);
      expect(fields).toContain('email');
      expect(fields).toContain('password');
    });

    it('should register a new customer, return token, and hide password hash', async () => {
      const res = await request(app).post('/api/auth/register').send({
        ...testUser,
        role: 'owner' // Attempt role escalation -> must be ignored!
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.role).toBe('customer');
      expect(res.body.user.password).toBeUndefined();

      createdUserIds.push(res.body.user.id);
    });

    it('should reject duplicate email with 409', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject wrong password with 401', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: 'WrongPassword123'
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should log in successfully with valid credentials and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testUser.email,
        password: testUser.password
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.password).toBeUndefined();

      authToken = res.body.token;
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return current user profile when valid Bearer token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe(testUser.email.toLowerCase());
      expect(res.body.user.fullName).toBe(testUser.fullName);
      expect(res.body.user.password).toBeUndefined();
    });
  });
});
