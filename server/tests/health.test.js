// tests/health.test.js
// Health check integration test using Jest and Supertest

const request = require('supertest');
const app = require('../src/app');

describe('Health Check Endpoint', () => {
  it('GET /health should return 200 and healthy status payload', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.status).toBe('ok');
    expect(typeof res.body.data.uptimeSeconds).toBe('number');
    expect(typeof res.body.data.timestamp).toBe('string');
  });

  it('GET /non-existent-route should return 404 with standard error format', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.message).toContain('Cannot GET /non-existent-route');
  });
});
