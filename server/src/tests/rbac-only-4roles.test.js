import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import { connectPrisma } from '../config/prisma.js';

describe('Strict RBAC Security Tests for the 4 Dedicated Roles', { timeout: 20000 }, () => {
  const DEV_PASSWORD = process.env.DEV_PASSWORD || 'PeoplePay360@123';

  let adminCookie = null;
  let hrCookie = null;
  let payrollCookie = null;
  let employeeCookie = null;

  let adminUser = null;
  let hrUser = null;
  let payrollUser = null;
  let employeeUser = null;

  beforeAll(async () => {
    await connectPrisma();
  });

  it('1. Authenticates all 4 roles with development credentials', async () => {
    // Admin login
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'indhu.admin@peoplepay360.in', password: DEV_PASSWORD });
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.success).toBe(true);
    expect(['ORGANIZATION_ADMIN', 'ADMIN']).toContain(adminRes.body.data.role);
    adminCookie = adminRes.headers['set-cookie']?.find((c) => c.startsWith('pp360_access_token='));
    adminUser = adminRes.body.data;

    // HR Manager login
    const hrRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'kavya.hr@peoplepay360.in', password: DEV_PASSWORD });
    expect(hrRes.status).toBe(200);
    expect(hrRes.body.success).toBe(true);
    expect(hrRes.body.data.role).toBe('HR_MANAGER');
    hrCookie = hrRes.headers['set-cookie']?.find((c) => c.startsWith('pp360_access_token='));
    hrUser = hrRes.body.data;

    // Payroll Manager login
    const payrollRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'vishal.payroll@peoplepay360.in', password: DEV_PASSWORD });
    expect(payrollRes.status).toBe(200);
    expect(payrollRes.body.success).toBe(true);
    expect(payrollRes.body.data.role).toBe('PAYROLL_MANAGER');
    payrollCookie = payrollRes.headers['set-cookie']?.find((c) => c.startsWith('pp360_access_token='));
    payrollUser = payrollRes.body.data;

    // Employee login
    const empRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'employee@peoplepay360.in', password: DEV_PASSWORD });
    expect(empRes.status).toBe(200);
    expect(empRes.body.success).toBe(true);
    expect(empRes.body.data.role).toBe('EMPLOYEE');
    employeeCookie = empRes.headers['set-cookie']?.find((c) => c.startsWith('pp360_access_token='));
    employeeUser = empRes.body.data;
  });

  it('2. GET /api/v1/auth/me returns the active session for all 4 roles', async () => {
    const adminMe = await request(app).get('/api/v1/auth/me').set('Cookie', adminCookie);
    expect(adminMe.status).toBe(200);
    expect(adminMe.body.data.email).toBe('indhu.admin@peoplepay360.in');

    const hrMe = await request(app).get('/api/v1/auth/me').set('Cookie', hrCookie);
    expect(hrMe.status).toBe(200);
    expect(hrMe.body.data.email).toBe('kavya.hr@peoplepay360.in');

    const payrollMe = await request(app).get('/api/v1/auth/me').set('Cookie', payrollCookie);
    expect(payrollMe.status).toBe(200);
    expect(payrollMe.body.data.email).toBe('vishal.payroll@peoplepay360.in');

    const empMe = await request(app).get('/api/v1/auth/me').set('Cookie', employeeCookie);
    expect(empMe.status).toBe(200);
    expect(empMe.body.data.email).toBe('employee@peoplepay360.in');
  });

  it('3. Organization Admin has complete administrative access', async () => {
    const empRes = await request(app).get('/api/v1/employees').set('Cookie', adminCookie);
    expect(empRes.status).toBe(200);
    expect(empRes.body.success).toBe(true);

    const deptRes = await request(app).get('/api/v1/departments').set('Cookie', adminCookie);
    expect(deptRes.status).toBe(200);

    const payrunRes = await request(app).get('/api/v1/payroll/payruns').set('Cookie', adminCookie);
    expect(payrunRes.status).toBe(200);

    const auditRes = await request(app).get('/api/v1/audit-logs').set('Cookie', adminCookie);
    expect(auditRes.status).toBe(200);

    const usersRes = await request(app).get('/api/v1/users').set('Cookie', adminCookie);
    expect(usersRes.status).toBe(200);
  });

  it('4. HR Manager can manage employees, leaves, attendance, but CANNOT access payroll, audit, or settings', async () => {
    // Allowed
    const empRes = await request(app).get('/api/v1/employees').set('Cookie', hrCookie);
    expect(empRes.status).toBe(200);

    const leaveRes = await request(app).get('/api/v1/leaves/requests').set('Cookie', hrCookie);
    expect(leaveRes.status).toBe(200);

    // Forbidden - Salary Structures
    const structRes = await request(app).get('/api/v1/payroll/structures').set('Cookie', hrCookie);
    expect(structRes.status).toBe(403);
    expect(structRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Create Payrun
    const payrunRes = await request(app)
      .post('/api/v1/payroll/payruns')
      .set('Cookie', hrCookie)
      .send({ name: 'HR Payrun Test', startDate: '2026-09-01', endDate: '2026-09-30' });
    expect(payrunRes.status).toBe(403);
    expect(payrunRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Audit logs
    const auditRes = await request(app).get('/api/v1/audit-logs').set('Cookie', hrCookie);
    expect(auditRes.status).toBe(403);
    expect(auditRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Users/Roles management
    const usersRes = await request(app).get('/api/v1/users').set('Cookie', hrCookie);
    expect(usersRes.status).toBe(403);
    expect(usersRes.body.error.code).toBe('FORBIDDEN');
  });

  it('5. Payroll Manager can manage payruns and structures, but CANNOT delete employees, approve leaves, or view audit logs', async () => {
    // Allowed
    const payrunsRes = await request(app).get('/api/v1/payroll/payruns').set('Cookie', payrollCookie);
    expect(payrunsRes.status).toBe(200);

    const structRes = await request(app).get('/api/v1/payroll/structures').set('Cookie', payrollCookie);
    expect(structRes.status).toBe(200);

    // Forbidden - Leave Approval
    const leaveApproveRes = await request(app)
      .post('/api/v1/leaves/requests/00000000-0000-0000-0000-000000000000/approve')
      .set('Cookie', payrollCookie);
    expect(leaveApproveRes.status).toBe(403);
    expect(leaveApproveRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Employee Deletion
    const deleteEmpRes = await request(app)
      .delete('/api/v1/employees/00000000-0000-0000-0000-000000000000')
      .set('Cookie', payrollCookie);
    expect(deleteEmpRes.status).toBe(403);
    expect(deleteEmpRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Audit logs
    const auditRes = await request(app).get('/api/v1/audit-logs').set('Cookie', payrollCookie);
    expect(auditRes.status).toBe(403);
    expect(auditRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Users/Roles
    const usersRes = await request(app).get('/api/v1/users').set('Cookie', payrollCookie);
    expect(usersRes.status).toBe(403);
    expect(usersRes.body.error.code).toBe('FORBIDDEN');
  });

  it('6. Employee can access own profile, attendance, leaves, and payslips, but CANNOT access directory, audit logs, or another employee’s record', async () => {
    // Allowed - Self profile
    const selfRes = await request(app).get('/api/v1/users/me').set('Cookie', employeeCookie);
    expect(selfRes.status).toBe(200);

    // Allowed - Self payslips
    const payslipsRes = await request(app).get('/api/v1/payroll/payslips').set('Cookie', employeeCookie);
    expect(payslipsRes.status).toBe(200);

    // Forbidden - Employees directory list
    const empListRes = await request(app).get('/api/v1/employees').set('Cookie', employeeCookie);
    expect(empListRes.status).toBe(403);
    expect(empListRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Departments list
    const deptRes = await request(app).get('/api/v1/departments').set('Cookie', employeeCookie);
    expect(deptRes.status).toBe(403);
    expect(deptRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Payroll runs
    const payrunsRes = await request(app).get('/api/v1/payroll/payruns').set('Cookie', employeeCookie);
    expect(payrunsRes.status).toBe(403);
    expect(payrunsRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Audit logs
    const auditRes = await request(app).get('/api/v1/audit-logs').set('Cookie', employeeCookie);
    expect(auditRes.status).toBe(403);
    expect(auditRes.body.error.code).toBe('FORBIDDEN');

    // Forbidden - Cross-employee inspection
    const adminEmployees = await request(app).get('/api/v1/employees').set('Cookie', adminCookie);
    const targetEmpId = adminEmployees.body.data?.[0]?.id;
    if (targetEmpId && targetEmpId !== employeeUser.employee?.id) {
      const inspectRes = await request(app).get(`/api/v1/employees/${targetEmpId}`).set('Cookie', employeeCookie);
      expect(inspectRes.status).toBe(403);
      expect(inspectRes.body.error.code).toBe('FORBIDDEN');
    }
  });

  it('7. Enforces organization tenant isolation against cross-tenant headers', async () => {
    const crossTenantRes = await request(app)
      .get('/api/v1/employees')
      .set('Cookie', hrCookie)
      .set('x-organization-id', '00000000-0000-0000-0000-000000000000');
    expect(crossTenantRes.status).toBe(403);
    expect(crossTenantRes.body.error.code).toBe('FORBIDDEN');
  });
});
