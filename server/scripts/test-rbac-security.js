import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/v1';
const DEV_PASSWORD = process.env.DEV_PASSWORD || 'Odoo@123';

const ACCOUNTS = {
  ADMIN: { email: 'indhu.admin@odoo.in', role: 'ORGANIZATION_ADMIN' },
  HR: { email: 'kavya.hr@odoo.in', role: 'HR_MANAGER' },
  PAYROLL: { email: 'vishal.payroll@odoo.in', role: 'PAYROLL_MANAGER' },
  EMPLOYEE: { email: 'employee@odoo.in', role: 'EMPLOYEE' },
};

async function login(email, password = DEV_PASSWORD) {
  const client = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true, // Don't throw on non-2xx
  });

  const res = await client.post('/auth/login', { email, password });
  if (!res.data.success) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }

  const cookie = res.headers['set-cookie'];
  const token = res.data.data?.token;

  const authClient = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(cookie ? { Cookie: cookie.join('; ') } : {}),
    },
  });

  return { client: authClient, user: res.data.data };
}

async function runSecurityAudit() {
  console.log('========================================================');
  console.log('  STARTING RBAC & SECURITY COMPLIANCE TEST SUITE');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, errorDetails = '') {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} - ${errorDetails}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate All 4 Roles
    console.log('--- 1. Authenticating 4 Target Accounts ---');
    const adminSession = await login(ACCOUNTS.ADMIN.email);
    assert(adminSession.user.role === 'ORGANIZATION_ADMIN', 'Admin login & role verification');

    const hrSession = await login(ACCOUNTS.HR.email);
    assert(hrSession.user.role === 'HR_MANAGER', 'HR Manager login & role verification');

    const payrollSession = await login(ACCOUNTS.PAYROLL.email);
    assert(payrollSession.user.role === 'PAYROLL_MANAGER', 'Payroll Manager login & role verification');

    const employeeSession = await login(ACCOUNTS.EMPLOYEE.email);
    assert(employeeSession.user.role === 'EMPLOYEE', 'Employee login & role verification');

    // 2. Auth Session Me (/auth/me) verification
    console.log('\n--- 2. Session /auth/me Verification ---');
    const meAdmin = await adminSession.client.get('/auth/me');
    assert(meAdmin.data.success && meAdmin.data.data.email === ACCOUNTS.ADMIN.email, 'Admin /auth/me');

    const meEmployee = await employeeSession.client.get('/auth/me');
    assert(meEmployee.data.success && meEmployee.data.data.email === ACCOUNTS.EMPLOYEE.email, 'Employee /auth/me');

    // 3. Organization Admin RBAC
    console.log('\n--- 3. Organization Admin RBAC ---');
    const adminEmployees = await adminSession.client.get('/employees');
    assert(adminEmployees.status === 200 && adminEmployees.data.success, 'Admin can read employees');

    const adminDept = await adminSession.client.get('/departments');
    assert(adminDept.status === 200 && adminDept.data.success, 'Admin can read departments');

    const adminPayruns = await adminSession.client.get('/payroll/payruns');
    assert(adminPayruns.status === 200 && adminPayruns.data.success, 'Admin can read payruns');

    const adminAudit = await adminSession.client.get('/audit-logs');
    assert(adminAudit.status === 200 && adminAudit.data.success, 'Admin can read audit logs');

    // 4. HR Manager RBAC & Boundaries
    console.log('\n--- 4. HR Manager RBAC & Boundaries ---');
    const hrEmployees = await hrSession.client.get('/employees');
    assert(hrEmployees.status === 200 && hrEmployees.data.success, 'HR can read employees');

    const hrLeaves = await hrSession.client.get('/leaves/requests');
    assert(hrLeaves.status === 200 && hrLeaves.data.success, 'HR can read leave requests');

    // HR forbidden from payroll structures
    const hrPayStructures = await hrSession.client.get('/payroll/structures');
    assert(
      hrPayStructures.status === 403 && hrPayStructures.data.error?.code === 'FORBIDDEN',
      'HR CANNOT read salary structures (403 Forbidden)',
      JSON.stringify(hrPayStructures.data)
    );

    // HR forbidden from payrun creation
    const hrCreatePayrun = await hrSession.client.post('/payroll/payruns', {
      name: 'Unauthorized Payrun',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
    });
    assert(
      hrCreatePayrun.status === 403 && hrCreatePayrun.data.error?.code === 'FORBIDDEN',
      'HR CANNOT create payrun (403 Forbidden)',
      JSON.stringify(hrCreatePayrun.data)
    );

    // HR forbidden from audit logs
    const hrAudit = await hrSession.client.get('/audit-logs');
    assert(
      hrAudit.status === 403 && hrAudit.data.error?.code === 'FORBIDDEN',
      'HR CANNOT access audit logs (403 Forbidden)',
      JSON.stringify(hrAudit.data)
    );

    // 5. Payroll Manager RBAC & Boundaries
    console.log('\n--- 5. Payroll Manager RBAC & Boundaries ---');
    const payrollPayruns = await payrollSession.client.get('/payroll/payruns');
    assert(payrollPayruns.status === 200 && payrollPayruns.data.success, 'Payroll Manager can read payruns');

    const payrollStructures = await payrollSession.client.get('/payroll/structures');
    assert(payrollStructures.status === 200 && payrollStructures.data.success, 'Payroll Manager can read structures');

    // Payroll forbidden from leave approval
    const payrollApproveLeave = await payrollSession.client.post('/leaves/requests/00000000-0000-0000-0000-000000000000/approve');
    assert(
      payrollApproveLeave.status === 403 && payrollApproveLeave.data.error?.code === 'FORBIDDEN',
      'Payroll Manager CANNOT approve leave requests (403 Forbidden)',
      JSON.stringify(payrollApproveLeave.data)
    );

    // Payroll forbidden from employee deletion
    const payrollDeleteEmp = await payrollSession.client.delete('/employees/00000000-0000-0000-0000-000000000000');
    assert(
      payrollDeleteEmp.status === 403 && payrollDeleteEmp.data.error?.code === 'FORBIDDEN',
      'Payroll Manager CANNOT delete employees (403 Forbidden)',
      JSON.stringify(payrollDeleteEmp.data)
    );

    // Payroll forbidden from audit logs
    const payrollAudit = await payrollSession.client.get('/audit-logs');
    assert(
      payrollAudit.status === 403 && payrollAudit.data.error?.code === 'FORBIDDEN',
      'Payroll Manager CANNOT access audit logs (403 Forbidden)',
      JSON.stringify(payrollAudit.data)
    );

    // 6. Employee RBAC & Boundaries
    console.log('\n--- 6. Employee RBAC & Boundaries ---');
    // Employee forbidden from employee list
    const empList = await employeeSession.client.get('/employees');
    assert(
      empList.status === 403 && empList.data.error?.code === 'FORBIDDEN',
      'Employee CANNOT read employee directory (403 Forbidden)',
      JSON.stringify(empList.data)
    );

    // Employee forbidden from departments list
    const empDepts = await employeeSession.client.get('/departments');
    assert(
      empDepts.status === 403 && empDepts.data.error?.code === 'FORBIDDEN',
      'Employee CANNOT read departments (403 Forbidden)',
      JSON.stringify(empDepts.data)
    );

    // Employee forbidden from payroll runs
    const empPayruns = await employeeSession.client.get('/payroll/payruns');
    assert(
      empPayruns.status === 403 && empPayruns.data.error?.code === 'FORBIDDEN',
      'Employee CANNOT read payroll runs (403 Forbidden)',
      JSON.stringify(empPayruns.data)
    );

    // Employee forbidden from audit logs
    const empAudit = await employeeSession.client.get('/audit-logs');
    assert(
      empAudit.status === 403 && empAudit.data.error?.code === 'FORBIDDEN',
      'Employee CANNOT access audit logs (403 Forbidden)',
      JSON.stringify(empAudit.data)
    );

    // Employee can read own user profile
    const empSelf = await employeeSession.client.get('/users/me');
    assert(empSelf.status === 200 && empSelf.data.success, 'Employee can read own profile');

    // Employee cross-employee ID access blocked
    const otherEmpId = adminEmployees.data.data?.[0]?.id;
    if (otherEmpId && otherEmpId !== employeeSession.user.employee?.id) {
      const empInspectOther = await employeeSession.client.get(`/employees/${otherEmpId}`);
      assert(
        empInspectOther.status === 403 && empInspectOther.data.error?.code === 'FORBIDDEN',
        'Employee CANNOT inspect another employee record by ID (403 Forbidden)',
        JSON.stringify(empInspectOther.data)
      );
    }

    // Employee payslips list returns only self records
    const empPayslips = await employeeSession.client.get('/payroll/payslips');
    assert(empPayslips.status === 200 && empPayslips.data.success, 'Employee can fetch own payslips list');

    // 7. Tenant Isolation (Cross-tenant header test)
    console.log('\n--- 7. Organization / Tenant Isolation ---');
    const crossTenantRes = await hrSession.client.get('/employees', {
      headers: { 'x-organization-id': '00000000-0000-0000-0000-000000000000' },
    });
    assert(
      crossTenantRes.status === 403 && crossTenantRes.data.error?.code === 'FORBIDDEN',
      'Cross-tenant request blocked with 403 Forbidden',
      JSON.stringify(crossTenantRes.data)
    );

    console.log('\n========================================================');
    console.log(`  AUDIT COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');
  } catch (err) {
    console.error('Fatal audit execution error:', err);
    process.exit(1);
  }
}

runSecurityAudit();
