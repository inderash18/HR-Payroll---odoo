import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectPrisma } from '../config/prisma.js';

describe('PeoplePay360 Express Backend API Tests', () => {
  let authCookie = null;

  beforeAll(async () => {
    await connectPrisma();
  });

  it('GET /api/v1/health/liveness returns 200 ok', async () => {
    const res = await request(app).get('/api/v1/health/liveness');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/v1/auth/login succeeds and sets HttpOnly cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@peoplepay360.local',
        password: 'admin123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@peoplepay360.local');
    expect(res.body.data.role).toBe('ADMIN');

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = cookies.find((c) => c.startsWith('pp360_access_token='));
    expect(authCookie).toBeDefined();
  });

  it('GET /api/v1/auth/me returns current user profile using cookie', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('ADMIN');
  });

  it('GET /api/v1/employees lists employees', async () => {
    const res = await request(app)
      .get('/api/v1/employees')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
  });

  it('GET /api/v1/departments lists departments', async () => {
    const res = await request(app)
      .get('/api/v1/departments')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/contracts lists contracts', async () => {
    const res = await request(app)
      .get('/api/v1/contracts')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/dashboard/overview returns high-level KPI metrics', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/overview')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activeEmployees).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/payroll/structures lists salary structures', async () => {
    const res = await request(app)
      .get('/api/v1/payroll/structures')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
