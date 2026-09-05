import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutGrid,
  Users,
  Layers,
  Briefcase,
  Calendar,
  Clock,
  CalendarDays,
  Landmark,
  LineChart,
  UserCheck,
  FileText,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react';

export function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/employees', label: 'Employees', icon: Users, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/departments', label: 'Departments', icon: Layers, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/contracts', label: 'Contracts', icon: Briefcase, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/schedules', label: 'Schedules', icon: Calendar, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/attendance', label: 'Attendance', icon: Clock, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/leaves', label: 'Leaves & Time Off', icon: CalendarDays, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/payroll', label: 'Payroll', icon: Landmark, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/payslips', label: 'Payslips', icon: LineChart, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/users', label: 'Users', icon: UserCheck, roles: ['ADMIN', 'HR_MANAGER'] },
    { to: '/audit', label: 'Audit Logs', icon: FileText, roles: ['ADMIN'] },
    { to: '/security', label: 'Account Security', icon: Shield, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const visibleNavItems = navItems.filter((item) => hasRole(...item.roles));

  return (
    <aside className="sidebar-dark">
      {/* Brand Circular Logo Button */}
      <div
        className="sidebar-logo"
        id="sidebar-logo-btn"
        title="PeoplePay360"
        onClick={() => navigate('/dashboard')}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: '#ffffff',
            color: '#0d0f12',
            fontWeight: 800,
            fontSize: '0.95rem',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 4px 12px rgba(255,255,255,0.15)',
          }}
        >
          360
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || 
            (item.to === '/employees' && location.pathname.startsWith('/employees/')) ||
            (item.to === '/payroll' && location.pathname.startsWith('/payroll/')) ||
            (item.to === '/payslips' && location.pathname.startsWith('/payslips/')) ||
            (item.to === '/security' && location.pathname === '/sessions') ||
            (item.to === '/audit' && location.pathname === '/audit-logs');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              data-tooltip={item.label}
            >
              <Icon size={20} strokeWidth={2.2} />
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Bottom Sign Out */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-nav-item logout-btn"
          id="btn-logout"
          data-tooltip="Sign Out"
          onClick={handleLogout}
        >
          <LogOut size={20} strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
}
