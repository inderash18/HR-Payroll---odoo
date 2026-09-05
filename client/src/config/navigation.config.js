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
  ORGANIZATION_ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Operations' },
    { to: '/leaves', label: 'Leave Management', icon: CalendarDays, section: 'Operations' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Finance' },
    { to: '/audit', label: 'Reports', icon: FileSpreadsheet, section: 'Finance' },
    { to: '/users', label: 'Roles & Access', icon: UserCheck, section: 'Governance' },
    { to: '/settings', label: 'Company Settings', icon: Layers, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield, section: 'Governance' },
  ],

  ADMIN: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Operations' },
    { to: '/leaves', label: 'Leave Management', icon: CalendarDays, section: 'Operations' },
    { to: '/payroll', label: 'Payroll', icon: Landmark, section: 'Finance' },
    { to: '/audit', label: 'Reports', icon: FileSpreadsheet, section: 'Finance' },
    { to: '/users', label: 'Roles & Access', icon: UserCheck, section: 'Governance' },
    { to: '/settings', label: 'Company Settings', icon: Layers, section: 'Governance' },
    { to: '/audit-logs', label: 'Audit Logs', icon: Shield, section: 'Governance' },
  ],

  HR_MANAGER: [
    { to: '/hr/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/employees', label: 'Employees', icon: Users, section: 'Workforce' },
    { to: '/employees', label: 'Employee Onboarding', icon: UserCheck, section: 'Workforce' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Workforce' },
    { to: '/leaves', label: 'Leave Requests', icon: CalendarDays, section: 'Workforce' },
    { to: '/departments', label: 'Departments', icon: Building, section: 'Workforce' },
    { to: '/documents', label: 'Documents', icon: Award, section: 'Compliance' },
    { to: '/audit', label: 'HR Reports', icon: FileText, section: 'Compliance' },
  ],

  PAYROLL_MANAGER: [
    { to: '/payroll/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark, section: 'Compensation' },
    { to: '/payroll', label: 'Salary Structures', icon: Layers, section: 'Compensation' },
    { to: '/contracts', label: 'Employee Compensation', icon: DollarSign, section: 'Compensation' },
    { to: '/attendance', label: 'Attendance Inputs', icon: Clock, section: 'Inputs' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Outputs' },
    { to: '/audit', label: 'Payroll Reports', icon: FileSpreadsheet, section: 'Reports' },
  ],

  HR_PAYROLL_MANAGER: [
    { to: '/payroll/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/payroll', label: 'Payroll Runs', icon: Landmark, section: 'Compensation' },
    { to: '/contracts', label: 'Employee Compensation', icon: DollarSign, section: 'Compensation' },
    { to: '/attendance', label: 'Attendance Inputs', icon: Clock, section: 'Inputs' },
    { to: '/payslips', label: 'Payslips', icon: LineChart, section: 'Outputs' },
    { to: '/audit', label: 'Payroll Reports', icon: FileSpreadsheet, section: 'Reports' },
  ],

  EMPLOYEE: [
    { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutGrid, section: 'Core' },
    { to: '/profile', label: 'My Profile', icon: Users, section: 'Self Service' },
    { to: '/attendance', label: 'Attendance', icon: Clock, section: 'Self Service' },
    { to: '/leaves', label: 'My Leave Requests', icon: CalendarDays, section: 'Self Service' },
    { to: '/payslips', label: 'My Payslips', icon: LineChart, section: 'Self Service' },
    { to: '/documents', label: 'Documents', icon: Award, section: 'Self Service' },
    { to: '/settings', label: 'Settings', icon: Layers, section: 'Account' },
  ],
};

export function getRoleDashboardPath(role) {
  switch (role) {
    case 'SUPER_ADMIN':
      return '/super-admin/dashboard';
    case 'ORGANIZATION_ADMIN':
    case 'ADMIN':
      return '/admin/dashboard';
    case 'HR_MANAGER':
      return '/hr/dashboard';
    case 'PAYROLL_MANAGER':
    case 'HR_PAYROLL_MANAGER':
    case 'HR_PAYROLL_USER':
      return '/payroll/dashboard';
    case 'FINANCE_MANAGER':
      return '/finance/dashboard';
    case 'DEPARTMENT_MANAGER':
      return '/manager/dashboard';
    case 'AUDITOR':
      return '/auditor/dashboard';
    case 'EMPLOYEE':
    default:
      return '/employee/dashboard';
  }
}

export function getNavigationForRole(role) {
  return ROLE_NAVIGATION[role] || ROLE_NAVIGATION.EMPLOYEE;
}

