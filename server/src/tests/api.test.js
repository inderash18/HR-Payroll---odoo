import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectPrisma } from '../config/prisma.js';

describe('PeoplePay360 Express Backend API Tests', () => {
  let authCookie = null;
  let employeeCookie = null;
  let hrCookie = null;
  let payrollCookie = null;
  let financeCookie = null;
  let managerCookie = null;
  let auditorCookie = null;
  let superAdminCookie = null;

  beforeAll(async () => {
    await connectPrisma();
  });

  it('GET /api/v1/health/liveness returns 200 ok', async () => {
    const res = await request(app).get('/api/v1/health/liveness');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/v1/auth/login succeeds for ORGANIZATION_ADMIN and sets HttpOnly cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@peoplepay360.local',
        password: 'admin123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('admin@peoplepay360.local');
    expect(['ADMIN', 'ORGANIZATION_ADMIN']).toContain(res.body.data.role);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    authCookie = cookies.find((c) => c.startsWith('pp360_access_token='));
    expect(authCookie).toBeDefined();
  });

  it('POST /api/v1/auth/login succeeds for all other 7 roles', async () => {
    const rolesToTest = [
      { email: 'superadmin@peoplepay360.local', role: 'SUPER_ADMIN' },
      { email: 'hr@peoplepay360.local', role: 'HR_MANAGER' },
      { email: 'payroll@peoplepay360.local', role: 'PAYROLL_MANAGER' },
      { email: 'finance@peoplepay360.local', role: 'FINANCE_MANAGER' },
      { email: 'manager@peoplepay360.local', role: 'DEPARTMENT_MANAGER' },
      { email: 'employee@peoplepay360.local', role: 'EMPLOYEE' },
      { email: 'auditor@peoplepay360.local', role: 'AUDITOR' },
    ];

    for (const r of rolesToTest) {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: r.email, password: 'admin123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(r.email);

      const cookie = res.headers['set-cookie']?.find((c) => c.startsWith('pp360_access_token='));
      if (r.role === 'SUPER_ADMIN') superAdminCookie = cookie;
      if (r.role === 'HR_MANAGER') hrCookie = cookie;
      if (r.role === 'PAYROLL_MANAGER') payrollCookie = cookie;
      if (r.role === 'FINANCE_MANAGER') financeCookie = cookie;
      if (r.role === 'DEPARTMENT_MANAGER') managerCookie = cookie;
      if (r.role === 'EMPLOYEE') employeeCookie = cookie;
      if (r.role === 'AUDITOR') auditorCookie = cookie;
    }
  });

  it('GET /api/v1/dashboard returns role-tailored datasets', async () => {
    // 1. Admin Dashboard
    const adminRes = await request(app).get('/api/v1/dashboard').set('Cookie', authCookie);
    expect(adminRes.status).toBe(200);
    expect(['ADMIN', 'ORGANIZATION_ADMIN']).toContain(adminRes.body.data.role);
    expect(adminRes.body.data.summary).toBeDefined();

    // 2. Super Admin Dashboard
    const superRes = await request(app).get('/api/v1/dashboard').set('Cookie', superAdminCookie);
    expect(superRes.status).toBe(200);
    expect(superRes.body.data.role).toBe('SUPER_ADMIN');
    expect(superRes.body.data.summary.totalOrganizations).toBeDefined();

    // 3. HR Manager Dashboard
    const hrRes = await request(app).get('/api/v1/dashboard').set('Cookie', hrCookie);
    expect(hrRes.status).toBe(200);
    expect(hrRes.body.data.role).toBe('HR_MANAGER');
    expect(hrRes.body.data.summary.employeeCount).toBeDefined();

    // 4. Payroll Manager Dashboard
    const payrollRes = await request(app).get('/api/v1/dashboard').set('Cookie', payrollCookie);
    expect(payrollRes.status).toBe(200);
    expect(['PAYROLL_MANAGER', 'HR_PAYROLL_MANAGER']).toContain(payrollRes.body.data.role);
    expect(payrollRes.body.data.summary.grossSalaryAmount).toBeDefined();

    // 5. Finance Manager Dashboard
    const financeRes = await request(app).get('/api/v1/dashboard').set('Cookie', financeCookie);
    expect(financeRes.status).toBe(200);
    expect(financeRes.body.data.role).toBe('FINANCE_MANAGER');
    expect(financeRes.body.data.summary.totalPayrollExpense).toBeDefined();

    // 6. Department Manager Dashboard
    const managerRes = await request(app).get('/api/v1/dashboard').set('Cookie', managerCookie);
    expect(managerRes.status).toBe(200);
    expect(managerRes.body.data.role).toBe('DEPARTMENT_MANAGER');

    // 7. Employee Dashboard
    const empRes = await request(app).get('/api/v1/dashboard').set('Cookie', employeeCookie);
    expect(empRes.status).toBe(200);
    expect(empRes.body.data.role).toBe('EMPLOYEE');
    expect(empRes.body.data.todayAttendance).toBeDefined();

    // 8. Auditor Dashboard
    const auditorRes = await request(app).get('/api/v1/dashboard').set('Cookie', auditorCookie);
    expect(auditorRes.status).toBe(200);
    expect(auditorRes.body.data.role).toBe('AUDITOR');
    expect(auditorRes.body.data.summary.complianceStatus).toBe('FULLY_COMPLIANT');
  }, 15000);

  it('Strict RBAC: EMPLOYEE cannot create contracts (403 Forbidden)', async () => {
    const res = await request(app)
      .post('/api/v1/contracts')
      .set('Cookie', employeeCookie)
      .send({
        employeeId: 'some-id',
        wage: 50000,
        startDate: '2026-01-01',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
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

  it('GET /api/v1/payroll/structures lists salary structures for Payroll Manager', async () => {
    const res = await request(app)
      .get('/api/v1/payroll/structures')
      .set('Cookie', payrollCookie);

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

  it('GET /api/v1/auth/sessions returns active session devices', async () => {
    const res = await request(app)
      .get('/api/v1/auth/sessions')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
