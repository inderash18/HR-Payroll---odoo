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
  Megaphone,
  Briefcase,
} from 'lucide-react';

export const ROLE_NAVIGATION = {
  SUPER_ADMIN: [
    { to: '/dashboard', label: 'Platform Health', icon: LayoutGrid, section: 'Core' },
    { to: '/admin/organizations', label: 'Organizations', icon: Building, section: 'Enterprise' },
    { to: '/users', label: 'Access & Team Roles', icon: Users, section: 'Enterprise' },
    { to: '/security', label: 'Security Center', icon: Shield, section: 'Governance' },
    { to: '/audit-logs', label: 'Global Audit Logs', icon: FileText, section: 'Governance' },
    { to: '/settings', label: 'Platform Settings', icon: Layers, section: 'Platform' },
  ],

  ORGANIZATION_ADMIN: [
    { to: '/dashboard', label: 'People & Delivery', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Team Members', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Squads & Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Workforce Availability', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leave & Availability', icon: CalendarDays, section: 'Workforce' },
    { to: '/payroll', label: 'Compensation & Payroll', icon: Landmark, section: 'Finance' },
    { to: '/payslips', label: 'Employee Payslips', icon: LineChart, section: 'Finance' },
    { to: '/audit', label: 'People Analytics', icon: FileText, section: 'Governance' },
    { to: '/users', label: 'Access & Team Roles', icon: UserCheck, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Trail', icon: Shield, section: 'Governance' },
  ],

  ADMIN: [
    { to: '/dashboard', label: 'People & Delivery', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Team Members', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Squads & Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Workforce Availability', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leave & Availability', icon: CalendarDays, section: 'Workforce' },
    { to: '/payroll', label: 'Compensation & Payroll', icon: Landmark, section: 'Finance' },
    { to: '/payslips', label: 'Employee Payslips', icon: LineChart, section: 'Finance' },
    { to: '/audit', label: 'People Analytics', icon: FileText, section: 'Governance' },
    { to: '/users', label: 'Access & Team Roles', icon: UserCheck, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Trail', icon: Shield, section: 'Governance' },
  ],

  HR_MANAGER: [
    { to: '/dashboard', label: 'People Operations', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Team Members', icon: Users, section: 'Workforce' },
    { to: '/attendance', label: 'Workforce Availability', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leave & WFH Requests', icon: CalendarDays, section: 'Workforce' },
    { to: '/departments', label: 'Squads & Departments', icon: Building, section: 'Workforce' },
    { to: '/documents', label: 'Compliance Records', icon: Award, section: 'Compliance' },
    { to: '/audit', label: 'People Analytics', icon: FileText, section: 'Compliance' },
  ],

  PAYROLL_MANAGER: [
    { to: '/dashboard', label: 'Compensation Overview', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Monthly Payruns', icon: Landmark, section: 'Compensation' },
    { to: '/contracts', label: 'Salary Components', icon: Layers, section: 'Compensation' },
    { to: '/employees', label: 'Team Compensation', icon: Users, section: 'Compensation' },
    { to: '/payslips', label: 'Generated Payslips', icon: LineChart, section: 'Compensation' },
    { to: '/audit', label: 'Payroll Analytics', icon: FileText, section: 'Reports' },
  ],

  HR_PAYROLL_MANAGER: [
    { to: '/dashboard', label: 'Compensation Overview', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Monthly Payruns', icon: Landmark, section: 'Compensation' },
    { to: '/contracts', label: 'Salary Components', icon: Layers, section: 'Compensation' },
    { to: '/employees', label: 'Team Compensation', icon: Users, section: 'Compensation' },
    { to: '/payslips', label: 'Generated Payslips', icon: LineChart, section: 'Compensation' },
    { to: '/audit', label: 'Payroll Analytics', icon: FileText, section: 'Reports' },
  ],

  HR_PAYROLL_USER: [
    { to: '/dashboard', label: 'Compensation Overview', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Monthly Payruns', icon: Landmark, section: 'Compensation' },
    { to: '/payslips', label: 'Generated Payslips', icon: LineChart, section: 'Compensation' },
    { to: '/audit', label: 'Payroll Analytics', icon: FileText, section: 'Reports' },
  ],

  FINANCE_MANAGER: [
    { to: '/dashboard', label: 'Finance Operations', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll Approvals', icon: DollarSign, section: 'Financials' },
    { to: '/payslips', label: 'Disbursement Status', icon: LineChart, section: 'Financials' },
    { to: '/departments', label: 'Department Budgets', icon: Building, section: 'Financials' },
    { to: '/audit', label: 'Financial Reports', icon: FileSpreadsheet, section: 'Reports' },
  ],

  DEPARTMENT_MANAGER: [
    { to: '/dashboard', label: 'Squad & Delivery', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'My Squad', icon: Users, section: 'Squad' },
    { to: '/attendance', label: 'Squad Availability', icon: Clock, section: 'Squad' },
    { to: '/leaves', label: 'Leave & WFH Approvals', icon: CheckSquare, section: 'Squad' },
    { to: '/audit', label: 'Delivery Reports', icon: FileText, section: 'Reports' },
  ],

  EMPLOYEE: [
    { to: '/dashboard', label: 'My Workspace', icon: LayoutGrid, section: 'Overview' },
    { to: '/attendance', label: 'Clocking & WFH', icon: Clock, section: 'Self Service' },
    { to: '/leaves', label: 'Leave & Time Off', icon: CalendarDays, section: 'Self Service' },
    { to: '/payslips', label: 'My Payslips', icon: LineChart, section: 'Financials' },
    { to: '/documents', label: 'My Documents', icon: Award, section: 'Records' },
  ],

  AUDITOR: [
    { to: '/dashboard', label: 'Compliance Overview', icon: LayoutGrid, section: 'Overview' },
    { to: '/audit-logs', label: 'System Audit Logs', icon: FileText, section: 'Compliance' },
    { to: '/security', label: 'Security Events', icon: Shield, section: 'Compliance' },
    { to: '/payroll', label: 'Payroll Audit Trail', icon: Landmark, section: 'Finance' },
    { to: '/audit', label: 'Compliance Reports', icon: Award, section: 'Reports' },
  ],
};

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.EMPLOYEE;
}

