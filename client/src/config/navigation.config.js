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
    { to: '/dashboard', label: 'Overview', icon: LayoutGrid, section: 'Core' },
    { to: '/admin/organizations', label: 'Organizations', icon: Building, section: 'Enterprise' },
    { to: '/users', label: 'Users & Access', icon: Users, section: 'Enterprise' },
    { to: '/security', label: 'Security Center', icon: Shield, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileText, section: 'Governance' },
    { to: '/settings', label: 'Platform Settings', icon: Layers, section: 'Platform' },
  ],

  ORGANIZATION_ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leave Management', icon: CalendarDays, section: 'Workforce' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Finance' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Finance' },
    { to: '/audit', label: 'Reports', icon: FileText, section: 'Governance' },
    { to: '/users', label: 'Roles & Access', icon: UserCheck, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield, section: 'Governance' },
  ],

  ADMIN: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leave Management', icon: CalendarDays, section: 'Workforce' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Finance' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Finance' },
    { to: '/audit', label: 'Reports', icon: FileText, section: 'Governance' },
    { to: '/users', label: 'Roles & Access', icon: UserCheck, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield, section: 'Governance' },
  ],

  HR_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarDays, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/documents', label: 'Documents', icon: Award, section: 'Compliance' },
    { to: '/audit', label: 'HR Reports', icon: FileText, section: 'Compliance' },
  ],

  PAYROLL_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark, section: 'Payroll' },
    { to: '/contracts', label: 'Salary Components', icon: Layers, section: 'Payroll' },
    { to: '/employees', label: 'Compensation', icon: Users, section: 'Payroll' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Payroll' },
    { to: '/audit', label: 'Payroll Reports', icon: FileText, section: 'Reports' },
  ],

  HR_PAYROLL_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark, section: 'Payroll' },
    { to: '/contracts', label: 'Salary Components', icon: Layers, section: 'Payroll' },
    { to: '/employees', label: 'Compensation', icon: Users, section: 'Payroll' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Payroll' },
    { to: '/audit', label: 'Payroll Reports', icon: FileText, section: 'Reports' },
  ],

  HR_PAYROLL_USER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark, section: 'Payroll' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Payroll' },
    { to: '/audit', label: 'Payroll Reports', icon: FileText, section: 'Reports' },
  ],

  FINANCE_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll Approvals', icon: DollarSign, section: 'Financials' },
    { to: '/payslips', label: 'Payment Status', icon: LineChart, section: 'Financials' },
    { to: '/departments', label: 'Cost Centers', icon: Building, section: 'Financials' },
    { to: '/audit', label: 'Financial Reports', icon: FileSpreadsheet, section: 'Reports' },
  ],

  DEPARTMENT_MANAGER: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'My Team', icon: Users, section: 'Team' },
    { to: '/attendance', label: 'Team Attendance', icon: Clock, section: 'Team' },
    { to: '/leaves', label: 'Team Leave Requests', icon: CheckSquare, section: 'Team' },
    { to: '/audit', label: 'Team Reports', icon: FileText, section: 'Reports' },
  ],

  EMPLOYEE: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Overview' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Self Service' },
    { to: '/leaves', label: 'Apply Leave', icon: CalendarDays, section: 'Self Service' },
    { to: '/payslips', label: 'My Payslips', icon: LineChart, section: 'Financials' },
    { to: '/documents', label: 'Documents', icon: Award, section: 'Records' },
  ],

  AUDITOR: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Overview' },
    { to: '/audit-logs', label: 'Audit Logs', icon: FileText, section: 'Compliance' },
    { to: '/security', label: 'Security Events', icon: Shield, section: 'Compliance' },
    { to: '/payroll', label: 'Payroll Audit', icon: Landmark, section: 'Finance' },
    { to: '/audit', label: 'Compliance Reports', icon: Award, section: 'Reports' },
  ],
};

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.EMPLOYEE;
}
