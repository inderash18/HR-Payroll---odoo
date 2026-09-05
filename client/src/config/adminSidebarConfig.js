import {
  LayoutGrid,
  Users,
  Building,
  Clock,
  CalendarDays,
  Landmark,
  FileText,
  UserCheck,
  Settings,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const ADMIN_SIDEBAR_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/departments', label: 'Departments', icon: Building },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/leaves', label: 'Leave Management', icon: CalendarDays },
  { to: '/payroll', label: 'Payroll', icon: Landmark },
  { to: '/audit', label: 'Reports', icon: FileText },
  { to: '/users', label: 'Roles & Access', icon: UserCheck },
  { to: '/settings', label: 'Company Settings', icon: Settings },
  { to: '/audit-logs', label: 'Audit Logs', icon: Shield },
];

export const ADMIN_SIDEBAR_BOTTOM = [
  { to: '/help', label: 'Help & Support', icon: HelpCircle },
];
