import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CalendarCheck,
  Clock,
  CalendarDays,
  CircleDollarSign,
  Receipt,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Settings,
  LogOut,
} from 'lucide-react';

export function Sidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/employees', label: 'Employees', icon: Users, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/departments', label: 'Departments', icon: Building2, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/contracts', label: 'Contracts', icon: FileText, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/schedules', label: 'Working Schedules', icon: CalendarCheck, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/attendance', label: 'Attendance', icon: Clock, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/leaves', label: 'Leaves & Time Off', icon: CalendarDays, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/payroll', label: 'Payroll Batches', icon: CircleDollarSign, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'] },
    { to: '/payslips', label: 'Payslips', icon: Receipt, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/users', label: 'User Management', icon: ShieldCheck, roles: ['ADMIN', 'HR_MANAGER'] },
    { to: '/audit-logs', label: 'Audit Logs', icon: ShieldAlert, roles: ['ADMIN'] },
    { to: '/security', label: 'Account Security', icon: KeyRound, roles: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'] },
    { to: '/settings', label: 'System Settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const visibleNavItems = navItems.filter((item) => hasRole(...item.roles));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">360</div>
        <div>
          <div className="logo-text">PeoplePay360</div>
        </div>
        <span className="logo-tag">PRO</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation</div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile-pill" onClick={() => navigate('/profile')}>
          <div className="user-avatar">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="user-info">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button
            title="Logout"
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
