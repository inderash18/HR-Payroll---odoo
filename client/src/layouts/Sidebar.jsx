import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutGrid,
  Users,
  Clock,
  CalendarDays,
  Landmark,
  LineChart,
  FileText,
  User,
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

  const navLinks = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutGrid,
      roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
    },
    {
      to: '/employees',
      label: 'Employees',
      icon: Users,
      roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'],
    },
    {
      to: '/attendance',
      label: 'Attendance',
      icon: Clock,
      roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
    },
    {
      to: '/leaves',
      label: 'Time Off',
      icon: CalendarDays,
      roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
    },
    {
      to: '/payroll',
      label: 'Payroll',
      icon: Landmark,
      roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'],
    },
    {
      to: '/payslips',
      label: 'Payslips',
      icon: LineChart,
      roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
    },
    {
      to: '/audit',
      label: 'Reports',
      icon: FileText,
      roles: ['ADMIN', 'HR_MANAGER'],
    },
  ];

  const visibleLinks = navLinks.filter((item) => hasRole(...item.roles));

  return (
    <aside className="sidebar-dark" id="main-application-sidebar">
      {/* BRAND HEADER */}
      <div
        className="sidebar-brand-container"
        id="sidebar-brand-header"
        onClick={() => navigate('/dashboard')}
      >
        <div className="sidebar-brand-logo">360</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">PeoplePay360</span>
          <span className="sidebar-brand-sub">HR &amp; Payroll</span>
        </div>
      </div>

      {/* MAIN NAVIGATION LIST */}
      <nav className="sidebar-nav">
        {visibleLinks.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.to ||
            (item.to === '/employees' && location.pathname.startsWith('/employees/')) ||
            (item.to === '/payroll' && location.pathname.startsWith('/payroll/')) ||
            (item.to === '/payslips' && location.pathname.startsWith('/payslips/')) ||
            (item.to === '/audit' && location.pathname === '/audit-logs');

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
              id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* BOTTOM ACTION LINKS */}
      <div className="sidebar-bottom">
        <NavLink
          to="/profile"
          className={`sidebar-nav-link ${location.pathname.startsWith('/profile') ? 'active' : ''}`}
          id="sidebar-link-my-profile"
        >
          <User size={18} />
          <span>My Profile</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={`sidebar-nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
          id="sidebar-link-settings"
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <button
          type="button"
          className="sidebar-nav-link logout"
          id="sidebar-link-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
