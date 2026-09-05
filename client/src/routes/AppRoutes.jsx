import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/Topbar';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';

import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { EmployeesPage } from '../pages/employees/EmployeesPage';
import { EmployeeDetailPage } from '../pages/employees/EmployeeDetailPage';
import { DepartmentsPage } from '../pages/departments/DepartmentsPage';
import { ContractsPage } from '../pages/contracts/ContractsPage';
import { SchedulesPage } from '../pages/schedules/SchedulesPage';
import { AttendancePage } from '../pages/attendance/AttendancePage';
import { LeavesPage } from '../pages/leaves/LeavesPage';
import { PayrollPage } from '../pages/payroll/PayrollPage';
import { PayrunDetailPage } from '../pages/payroll/PayrunDetailPage';
import { PayslipsPage } from '../pages/payroll/PayslipsPage';
import { PayslipDetailPage } from '../pages/payroll/PayslipDetailPage';
import { UsersPage } from '../pages/users/UsersPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { SecurityPage } from '../pages/security/SecurityPage';
import { ProfilePage, SettingsPage, ForbiddenPage, NotFoundPage } from '../pages/profile/ProfilePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated routes wrapped in AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Role-specific dashboard route aliases */}
        <Route path="/super-admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/hr/dashboard" element={<DashboardPage />} />
        <Route path="/payroll/dashboard" element={<DashboardPage />} />
        <Route path="/finance/dashboard" element={<DashboardPage />} />
        <Route path="/manager/dashboard" element={<DashboardPage />} />
        <Route path="/employee/dashboard" element={<DashboardPage />} />
        <Route path="/auditor/dashboard" element={<DashboardPage />} />

        {/* Workforce & Lifecycle */}
        <Route
          path="/employees"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'HR_PAYROLL_MANAGER', 'DEPARTMENT_MANAGER']}>
              <EmployeesPage />
            </RoleRoute>
          }
        />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        
        <Route
          path="/departments"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'FINANCE_MANAGER']}>
              <DepartmentsPage />
            </RoleRoute>
          }
        />
        
        <Route
          path="/contracts"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'HR_PAYROLL_MANAGER']}>
              <ContractsPage />
            </RoleRoute>
          }
        />
        
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        
        {/* Payroll & Financial Management */}
        <Route
          path="/payroll"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'PAYROLL_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'FINANCE_MANAGER', 'AUDITOR']}>
              <PayrollPage />
            </RoleRoute>
          }
        />
        <Route path="/payroll/payruns/:id" element={<PayrunDetailPage />} />
        <Route path="/payslips" element={<PayslipsPage />} />
        <Route path="/payslips/:id" element={<PayslipDetailPage />} />
        
        {/* User & Access Management */}
        <Route
          path="/users"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN']}>
              <UsersPage />
            </RoleRoute>
          }
        />
        
        {/* Compliance & Audit */}
        <Route
          path="/audit"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'AUDITOR', 'HR_MANAGER', 'FINANCE_MANAGER', 'PAYROLL_MANAGER']}>
              <AuditLogsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <RoleRoute allowedRoles={['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'AUDITOR', 'HR_MANAGER', 'FINANCE_MANAGER', 'PAYROLL_MANAGER']}>
              <AuditLogsPage />
            </RoleRoute>
          }
        />
        
        {/* Profile & Settings */}
        <Route path="/security" element={<ProfilePage tab="security" />} />
        <Route path="/sessions" element={<ProfilePage tab="security" />} />
        <Route path="/profile" element={<ProfilePage tab="overview" />} />
        <Route path="/profile/edit" element={<ProfilePage tab="edit" />} />
        <Route path="/profile/security" element={<ProfilePage tab="security" />} />
        <Route path="/profile/documents" element={<ProfilePage tab="documents" />} />
        <Route path="/profile/attendance" element={<AttendancePage />} />
        <Route path="/profile/leave" element={<LeavesPage />} />
        <Route path="/profile/payslips" element={<PayslipsPage />} />
        <Route path="/profile/settings" element={<SettingsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
