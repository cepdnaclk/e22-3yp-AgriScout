const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Health API', () => {
  it('GET /api/health should return 200 with healthy status and database info', async () => {
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.service).toBe('greenhouse-robot-backend');
    expect(res.body.database.connected).toBe(true);
    expect(res.body.database.state).toBe('connected');
    expect(typeof res.body.uptime).toBe('number');
  });
});
