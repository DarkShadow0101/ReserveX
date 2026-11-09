const request = require('supertest');
const app = require('../src/app');

describe('Health Check API', () => {
  it('GET /health should return 200 and healthy message', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.message).toBe('ReserveX API is healthy and running');
    expect(res.body).toHaveProperty('timestamp');
  });
});
