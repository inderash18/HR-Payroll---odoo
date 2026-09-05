export const PERMISSIONS = {
  // Organization
  ORGANIZATION_READ: 'organization.read',
  ORGANIZATION_UPDATE: 'organization.update',

  // Employees
  EMPLOYEES_READ: 'employees.read',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_UPDATE: 'employees.update',
  EMPLOYEES_DELETE: 'employees.delete',
  ONBOARDING_MANAGE: 'onboarding.manage',

  // Departments
  DEPARTMENTS_READ: 'departments.read',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',

  // Attendance
  ATTENDANCE_READ_ALL: 'attendance.read.all',
  ATTENDANCE_READ_OWN: 'attendance.read.own',
  ATTENDANCE_MANAGE: 'attendance.manage',
  ATTENDANCE_CHECKIN: 'attendance.checkin',
  ATTENDANCE_CHECKOUT: 'attendance.checkout',

  // Leave Management
  LEAVE_READ_ALL: 'leave.read.all',
  LEAVE_READ_OWN: 'leave.read.own',
  LEAVE_APPLY: 'leave.apply',
  LEAVE_APPROVE: 'leave.approve',
  LEAVE_CANCEL_OWN: 'leave.cancel.own',

  // Payroll & Compensation
  PAYROLL_READ_ALL: 'payroll.read.all',
  PAYROLL_CREATE: 'payroll.create',
  PAYROLL_CALCULATE: 'payroll.calculate',
  PAYROLL_SUBMIT: 'payroll.submit',
  PAYROLL_EXPORT: 'payroll.export',
  SALARY_STRUCTURES_READ: 'salary_structures.read',
  SALARY_STRUCTURES_CREATE: 'salary_structures.create',
  SALARY_STRUCTURES_UPDATE: 'salary_structures.update',
  SALARY_COMPONENTS_READ: 'salary_components.read',
  SALARY_COMPONENTS_CREATE: 'salary_components.create',
  SALARY_COMPONENTS_UPDATE: 'salary_components.update',
  COMPENSATION_READ: 'compensation.read',
  COMPENSATION_UPDATE: 'compensation.update',
  PAYSLIPS_READ_ALL: 'payslips.read.all',
  PAYSLIPS_READ_OWN: 'payslips.read.own',
  PAYSLIPS_GENERATE: 'payslips.generate',
  TAX_RULES_READ: 'tax_rules.read',
  TAX_RULES_UPDATE: 'tax_rules.update',

  // Reports
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',
  REPORTS_HR_READ: 'reports.hr.read',
  PAYROLL_REPORTS_READ: 'payroll_reports.read',

  // User Access, Settings, Audit
  USERS_READ: 'users.read',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  ROLES_MANAGE: 'roles.manage',
  SETTINGS_MANAGE: 'settings.manage',
  SETTINGS_UPDATE_OWN: 'settings.update.own',
  AUDIT_READ: 'audit.read',

  // Employee Self Service
  PROFILE_READ_OWN: 'profile.read.own',
  PROFILE_UPDATE_OWN: 'profile.update.own',
  DOCUMENTS_MANAGE: 'documents.manage',
  DOCUMENTS_READ_OWN: 'documents.read.own',
  ANNOUNCEMENTS_MANAGE: 'announcements.manage',
  NOTIFICATIONS_READ_OWN: 'notifications.read.own',
};

export const ROLE_PERMISSIONS = {
  ORGANIZATION_ADMIN: [
    'organization.read',
    'organization.update',
    'employees.read',
    'employees.create',
    'employees.update',
    'employees.delete',
    'departments.read',
    'departments.create',
    'departments.update',
    'departments.delete',
    'attendance.read.all',
    'leave.read.all',
    'leave.approve',
    'payroll.read.all',
    'reports.read',
    'reports.export',
    'users.read',
    'users.create',
    'users.update',
    'roles.manage',
    'settings.manage',
    'audit.read',
  ],

  ADMIN: [
    'organization.read',
    'organization.update',
    'employees.read',
    'employees.create',
    'employees.update',
    'employees.delete',
    'departments.read',
    'departments.create',
    'departments.update',
    'departments.delete',
    'attendance.read.all',
    'leave.read.all',
    'leave.approve',
    'payroll.read.all',
    'reports.read',
    'reports.export',
    'users.read',
    'users.create',
    'users.update',
    'roles.manage',
    'settings.manage',
    'audit.read',
  ],

  HR_MANAGER: [
    'employees.read',
    'employees.create',
    'employees.update',
    'onboarding.manage',
    'attendance.read.all',
    'attendance.manage',
    'leave.read.all',
    'leave.approve',
    'departments.read',
    'documents.manage',
    'announcements.manage',
    'reports.hr.read',
  ],

  PAYROLL_MANAGER: [
    'payroll.read.all',
    'payroll.create',
    'payroll.calculate',
    'payroll.submit',
    'salary_structures.read',
    'salary_structures.create',
    'salary_structures.update',
    'salary_components.read',
    'salary_components.create',
    'salary_components.update',
    'compensation.read',
    'compensation.update',
    'payslips.read.all',
    'payslips.generate',
    'tax_rules.read',
    'tax_rules.update',
    'payroll_reports.read',
    'payroll.export',
  ],

  HR_PAYROLL_MANAGER: [
    'payroll.read.all',
    'payroll.create',
    'payroll.calculate',
    'payroll.submit',
    'salary_structures.read',
    'salary_structures.create',
    'salary_structures.update',
    'salary_components.read',
    'salary_components.create',
    'salary_components.update',
    'compensation.read',
    'compensation.update',
    'payslips.read.all',
    'payslips.generate',
    'tax_rules.read',
    'tax_rules.update',
    'payroll_reports.read',
    'payroll.export',
  ],

  EMPLOYEE: [
    'profile.read.own',
    'profile.update.own',
    'attendance.read.own',
    'attendance.checkin',
    'attendance.checkout',
    'leave.read.own',
    'leave.apply',
    'leave.cancel.own',
    'payslips.read.own',
    'documents.read.own',
    'notifications.read.own',
    'settings.update.own',
  ],
};

export function getPermissionsForRole(role) {
  if (!role) return [];
  if (role === 'SUPER_ADMIN') {
    return Object.values(PERMISSIONS);
  }
  return ROLE_PERMISSIONS[role] || [];
}

export function hasPermission(userRole, requiredPermission) {
  if (!userRole) return false;
  if (userRole === 'SUPER_ADMIN') return true;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(requiredPermission);
}

