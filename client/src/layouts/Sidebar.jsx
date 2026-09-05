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

import { getNavigationForRole } from '../config/navigation.config';

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || 'Sneha Iyer';

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : (displayName.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'SI').toUpperCase();

  const roleTitle =
    user?.employee?.jobTitle ||
    user?.employee?.job_title ||
    user?.employee?.position ||
    (user?.role ? user.role.replace(/_/g, ' ') : 'Shift Supervisor');

  const visibleLinks = getNavigationForRole(user?.role);

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

      {/* DIVIDER */}
      <div className="sidebar-divider" />

      {/* USER PROFILE SUMMARY CARD */}
      <div
        className="sidebar-user-card"
        id="sidebar-user-profile-summary"
        onClick={() => navigate('/profile')}
        title="View Profile"
      >
        <div className="sidebar-user-avatar">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Avatar" className="sidebar-avatar-img" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{displayName}</span>
          <span className="sidebar-user-role">{roleTitle}</span>
        </div>
      </div>

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
