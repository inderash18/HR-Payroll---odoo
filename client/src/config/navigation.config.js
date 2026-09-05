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
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/admin/organizations', label: 'Organizations', icon: Building, section: 'Enterprise' },
    { to: '/users', label: 'Users', icon: Users, section: 'Enterprise' },
    { to: '/security', label: 'Security', icon: Shield, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileText, section: 'Governance' },
    { to: '/settings', label: 'Settings', icon: Layers, section: 'Platform' },
  ],

  ORGANIZATION_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leaves', icon: CalendarDays, section: 'Workforce' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Finance' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Finance' },
    { to: '/users', label: 'Users', icon: UserCheck, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield, section: 'Governance' },
  ],

  ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leaves', icon: CalendarDays, section: 'Workforce' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Finance' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Finance' },
    { to: '/users', label: 'Users', icon: UserCheck, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield, section: 'Governance' },
  ],

  HR_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leaves', icon: CalendarDays, section: 'Workforce' },
    { to: '/documents', label: 'Documents', icon: Award, section: 'Compliance' },
    { to: '/audit', label: 'Reports', icon: FileText, section: 'Compliance' },
  ],

  PAYROLL_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Compensation' },
    { to: '/contracts', label: 'Contracts', icon: Layers, section: 'Compensation' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Compensation' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Compensation' },
    { to: '/audit', label: 'Reports', icon: FileText, section: 'Reports' },
  ],

  HR_PAYROLL_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Compensation' },
    { to: '/contracts', label: 'Contracts', icon: Layers, section: 'Compensation' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Compensation' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Compensation' },
    { to: '/audit', label: 'Reports', icon: FileText, section: 'Reports' },
  ],

  HR_PAYROLL_USER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Compensation' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Compensation' },
    { to: '/audit', label: 'Reports', icon: FileText, section: 'Reports' },
  ],

  FINANCE_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll', icon: DollarSign, section: 'Financials' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Financials' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Financials' },
    { to: '/audit', label: 'Reports', icon: FileSpreadsheet, section: 'Reports' },
  ],

  DEPARTMENT_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'My Team', icon: Users, section: 'Team' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Team' },
    { to: '/leaves', label: 'Leaves', icon: CheckSquare, section: 'Team' },
    { to: '/audit', label: 'Reports', icon: FileText, section: 'Reports' },
  ],

  EMPLOYEE: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Overview' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Self Service' },
    { to: '/leaves', label: 'Leaves', icon: CalendarDays, section: 'Self Service' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Self Service' },
    { to: '/documents', label: 'Documents', icon: Award, section: 'Self Service' },
  ],

  AUDITOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Overview' },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileText, section: 'Compliance' },
    { to: '/security', label: 'Security', icon: Shield, section: 'Compliance' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Finance' },
    { to: '/audit', label: 'Reports', icon: Award, section: 'Reports' },
  ],
};

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.EMPLOYEE;
}
