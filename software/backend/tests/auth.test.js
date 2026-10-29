const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Auth API & RBAC', () => {
  it('should register first user as admin', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'First Admin',
        email: 'admin@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('admin');
    expect(res.body.token).toBeDefined();
  });

  it('should register second user as viewer by default', async () => {
    // First user (admin)
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Password123!'
      });

    // Second user (attempting to claim admin)
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Second User',
        email: 'second@example.com',
        password: 'Password123!',
        role: 'admin' // Should be ignored without admin authentication
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.role).toBe('viewer');
  });

  it('should reject registration with duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'duplicate@example.com',
        password: 'Password123!'
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'duplicate@example.com',
        password: 'Password123!'
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login successfully with correct credentials', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'SecretPassword123!'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'SecretPassword123!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('should reject login with wrong password', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Login User',
        email: 'login@example.com',
        password: 'SecretPassword123!'
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'WrongPassword!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should fetch user profile with valid JWT on /api/auth/me', async () => {
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Me User',
        email: 'me@example.com',
        password: 'Password123!'
      });

    const token = regRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.user.email).toBe('me@example.com');
  });
});
