import {
  LayoutGrid,
  Users,
  Clock,
  CalendarDays,
  Landmark,
  LineChart,
  FileText,
  Shield,
  Building,
  CheckSquare,
  DollarSign,
  UserCheck,
  Award,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

export const ROLE_NAVIGATION = {
  SUPER_ADMIN: [
    { to: '/dashboard', label: 'Overview', icon: LayoutGrid },
    { to: '/admin/organizations', label: 'Organizations', icon: Building },
    { to: '/users', label: 'Users', icon: Users },
    { to: '/security', label: 'Security Center', icon: Shield },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileText },
    { to: '/settings', label: 'Platform Settings', icon: Layers },
  ],

  ORGANIZATION_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/leaves', label: 'Leave Management', icon: CalendarDays },
    { to: '/payroll', label: 'Payroll', icon: Landmark },
    { to: '/payslips', label: 'Payslips', icon: LineChart },
    { to: '/audit', label: 'Reports', icon: FileText },
    { to: '/users', label: 'Roles & Access', icon: UserCheck },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield },
  ],

  ADMIN: [
    // Legacy alias for ORGANIZATION_ADMIN
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/departments', label: 'Departments', icon: Building },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/leaves', label: 'Leave Management', icon: CalendarDays },
    { to: '/payroll', label: 'Payroll', icon: Landmark },
    { to: '/payslips', label: 'Payslips', icon: LineChart },
    { to: '/audit', label: 'Reports', icon: FileText },
    { to: '/users', label: 'Roles & Access', icon: UserCheck },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield },
  ],

  HR_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/employees', label: 'Employees', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarDays },
    { to: '/departments', label: 'Departments', icon: Building },
    { to: '/documents', label: 'Documents', icon: Award },
    { to: '/audit', label: 'HR Reports', icon: FileText },
  ],

  PAYROLL_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark },
    { to: '/contracts', label: 'Salary Components', icon: Layers },
    { to: '/employees', label: 'Compensation', icon: Users },
    { to: '/payslips', label: 'Payslips', icon: LineChart },
    { to: '/audit', label: 'Payroll Reports', icon: FileText },
  ],

  HR_PAYROLL_MANAGER: [
    // Legacy alias
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark },
    { to: '/contracts', label: 'Salary Components', icon: Layers },
    { to: '/employees', label: 'Compensation', icon: Users },
    { to: '/payslips', label: 'Payslips', icon: LineChart },
    { to: '/audit', label: 'Payroll Reports', icon: FileText },
  ],

  HR_PAYROLL_USER: [
    // Legacy alias
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark },
    { to: '/payslips', label: 'Payslips', icon: LineChart },
    { to: '/audit', label: 'Payroll Reports', icon: FileText },
  ],

  FINANCE_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/payroll', label: 'Payroll Approvals', icon: DollarSign },
    { to: '/payslips', label: 'Payment Status', icon: LineChart },
    { to: '/departments', label: 'Cost Centers', icon: Building },
    { to: '/audit', label: 'Financial Reports', icon: FileSpreadsheet },
  ],

  DEPARTMENT_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/employees', label: 'My Team', icon: Users },
    { to: '/attendance', label: 'Team Attendance', icon: Clock },
    { to: '/leaves', label: 'Team Leave Requests', icon: CheckSquare },
    { to: '/audit', label: 'Team Reports', icon: FileText },
  ],

  EMPLOYEE: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/attendance', label: 'Attendance', icon: Clock },
    { to: '/leaves', label: 'Apply Leave', icon: CalendarDays },
    { to: '/payslips', label: 'My Payslips', icon: LineChart },
    { to: '/documents', label: 'Documents', icon: Award },
  ],

  AUDITOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileText },
    { to: '/security', label: 'Security Events', icon: Shield },
    { to: '/payroll', label: 'Payroll Audit', icon: Landmark },
    { to: '/audit', label: 'Compliance Reports', icon: Award },
  ],
};

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.EMPLOYEE;
}
