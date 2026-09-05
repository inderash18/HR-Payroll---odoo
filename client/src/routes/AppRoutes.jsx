import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/Topbar';
import { ProtectedRoute } from './ProtectedRoute';

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
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        <Route path="/departments" element={<DepartmentsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/schedules" element={<SchedulesPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/payroll" element={<PayrollPage />} />
        <Route path="/payroll/payruns/:id" element={<PayrunDetailPage />} />
        <Route path="/payslips" element={<PayslipsPage />} />
        <Route path="/payslips/:id" element={<PayslipDetailPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
