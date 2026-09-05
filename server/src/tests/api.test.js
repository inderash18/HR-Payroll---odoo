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
    expect(res.body.data.activeEmployees).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/v1/payroll/structures lists salary structures', async () => {
    const res = await request(app)
      .get('/api/v1/payroll/structures')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/v1/users/me returns full profile details', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@peoplepay360.local');
    expect(res.body.data.organization).toBeDefined();
  });

  it('PATCH /api/v1/users/me updates profile personal information', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', authCookie)
      .send({
        firstName: 'System',
        lastName: 'Admin',
        phone: '+91 9988776655',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe('System');
  });

  it('POST & DELETE /api/v1/users/me/avatar manages profile avatar', async () => {
    const dummyAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const uploadRes = await request(app)
      .post('/api/v1/users/me/avatar')
      .set('Cookie', authCookie)
      .send({ avatarData: dummyAvatar });

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.success).toBe(true);
    expect(uploadRes.body.data.avatarUrl).toBe(dummyAvatar);

    const deleteRes = await request(app)
      .delete('/api/v1/users/me/avatar')
      .set('Cookie', authCookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('GET & PATCH /api/v1/users/me/preferences manages notification preferences', async () => {
    const patchRes = await request(app)
      .patch('/api/v1/users/me/preferences')
      .set('Cookie', authCookie)
      .send({
        emailNotifications: true,
        payrollAlerts: false,
        leaveAlerts: true,
        securityAlerts: true,
        theme: 'light',
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.success).toBe(true);
    expect(patchRes.body.data.payrollAlerts).toBe(false);

    const getRes = await request(app)
      .get('/api/v1/users/me/preferences')
      .set('Cookie', authCookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.payrollAlerts).toBe(false);
  });

  it('POST, GET, & DELETE /api/v1/users/me/documents manages documents', async () => {
    const uploadRes = await request(app)
      .post('/api/v1/users/me/documents')
      .set('Cookie', authCookie)
      .send({
        name: 'Passport Copy',
        category: 'IDENTITY',
        fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCg==',
        mimeType: 'application/pdf',
        fileSize: 1024,
      });

    expect(uploadRes.status).toBe(201);
    expect(uploadRes.body.success).toBe(true);
    const docId = uploadRes.body.data.id;
    expect(docId).toBeDefined();

    const getRes = await request(app)
      .get('/api/v1/users/me/documents')
      .set('Cookie', authCookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.some((d) => d.id === docId)).toBe(true);

    const deleteRes = await request(app)
      .delete(`/api/v1/users/me/documents/${docId}`)
      .set('Cookie', authCookie);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });

  it('GET /api/v1/auth/sessions returns active session devices', async () => {
    const res = await request(app)
      .get('/api/v1/auth/sessions')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
