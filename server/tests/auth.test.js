// tests/auth.test.js
// Integration tests for Auth endpoints and validation rules using Supertest

const request = require('supertest');
const app = require('../src/app');

describe('Auth Endpoints & Validation', () => {
  describe('POST /api/v1/auth/register - Validation', () => {
    it('should reject registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toHaveProperty('details');
      expect(Array.isArray(res.body.error.details)).toBe(true);

      const fields = res.body.error.details.map((d) => d.field);
      expect(fields).toContain('email');
      expect(fields).toContain('password');
      expect(fields).toContain('fullName');
    });

    it('should reject registration when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'not-an-email',
          password: 'validPassword123',
          fullName: 'Test User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      const emailError = res.body.error.details.find((d) => d.field === 'email');
      expect(emailError).toBeDefined();
      expect(emailError.message).toBe('Invalid email address format');
    });

    it('should reject registration when password is shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'valid@college.edu',
          password: 'short',
          fullName: 'Test User'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      const passwordError = res.body.error.details.find((d) => d.field === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError.message).toBe('Password must be at least 8 characters long');
    });

    it('should reject registration when full name is shorter than 2 characters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'valid@college.edu',
          password: 'validPassword123',
          fullName: 'A'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      const nameError = res.body.error.details.find((d) => d.field === 'fullName');
      expect(nameError).toBeDefined();
      expect(nameError.message).toBe('Full name must be at least 2 characters long');
    });
  });

  describe('POST /api/v1/auth/login - Validation', () => {
    it('should reject login when email or password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      const fields = res.body.error.details.map((d) => d.field);
      expect(fields).toContain('email');
      expect(fields).toContain('password');
    });

    it('should reject login when email is improperly formatted', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'bad-email-format',
          password: 'anyPassword'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      const emailError = res.body.error.details.find((d) => d.field === 'email');
      expect(emailError).toBeDefined();
    });
  });

  describe('GET /api/v1/auth/me - Authentication Guard', () => {
    it('should return 401 Unauthorized when no Authorization header is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Authentication token missing');
    });

    it('should return 401 Unauthorized when Authorization format is not Bearer', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Basic 123456');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Bearer token required');
    });

    it('should return 401 Unauthorized when JWT token is invalid or malformed', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid token');
    });
  });
});
