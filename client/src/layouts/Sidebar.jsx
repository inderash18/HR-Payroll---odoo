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

import { useLayout } from '../contexts/LayoutContext';
import { PanelLeftClose } from 'lucide-react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : user?.name || 'Aarav Sharma';

  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : (displayName.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'AS').toUpperCase();

  const roleTitle =
    user?.employee?.jobPosition?.title ||
    user?.employee?.jobTitle ||
    (user?.role ? user.role.replace(/_/g, ' ') : 'ORGANIZATION ADMIN');

  const visibleLinks = getNavigationForRole(user?.role);

  // Group links by section for clean information hierarchy
  let currentSection = null;

  return (
    <aside className={`sidebar-dark ${isSidebarCollapsed ? 'collapsed' : ''}`} id="main-application-sidebar">
      {/* BRAND HEADER & WORKSPACE */}
      <div className="sidebar-header-wrapper">
        <div className="sidebar-brand-row">
          <div
            className="sidebar-brand-container"
            id="sidebar-brand-header"
            onClick={() => navigate('/dashboard')}
          >
            <div className="sidebar-brand-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-brand-title">PeoplePay360</span>
              <span className="sidebar-brand-sub">ENTERPRISE HR &amp; PAYROLL</span>
            </div>
          </div>

          <button
            type="button"
            className="btn-sidebar-collapse"
            id="btn-collapse-sidebar"
            title="Hide Sidebar (Ctrl + B)"
            onClick={toggleSidebar}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        <div className="sidebar-workspace-badge">
          <span className="workspace-status-dot"></span>
          <span className="workspace-name">{user?.organization?.name || 'PeoplePay360 India'}</span>
        </div>
      </div>

      {/* MAIN NAVIGATION LIST WITH CATEGORIZED SECTIONS */}
      <nav className="sidebar-nav">
        {visibleLinks.map((item, idx) => {
          const Icon = item.icon;
          const showSectionHeader = item.section && item.section !== currentSection;
          if (showSectionHeader) {
            currentSection = item.section;
          }

          const isActive =
            location.pathname === item.to ||
            (item.to === '/documents' && (location.pathname === '/documents' || location.pathname === '/profile/documents')) ||
            (item.to === '/employees' && location.pathname.startsWith('/employees/')) ||
            (item.to === '/payroll' && location.pathname.startsWith('/payroll/')) ||
            (item.to === '/payslips' && location.pathname.startsWith('/payslips/')) ||
            (item.to === '/audit' && location.pathname.startsWith('/audit/'));

          return (
            <React.Fragment key={item.to + idx}>
              {showSectionHeader && (
                <div className="sidebar-section-label">{item.section}</div>
              )}
              <NavLink
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/documents' || item.to === '/profile'}
                className={() => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                id={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="nav-icon-wrapper">
                  <Icon size={17} />
                </div>
                <span className="nav-label">{item.label}</span>
                {isActive && <div className="active-glow-pill"></div>}
              </NavLink>
            </React.Fragment>
          );
        })}
      </nav>

      {/* USER PROFILE & FOOTER SECTION */}
      <div className="sidebar-footer-group">
        <div
          className="sidebar-user-card"
          id="sidebar-user-profile-summary"
          onClick={() => navigate('/profile')}
          title="Open Profile & Account Settings"
        >
          <div className="sidebar-user-avatar">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="sidebar-avatar-img" />
            ) : (
              <span>{initials}</span>
            )}
            <span className="avatar-status-badge"></span>
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{displayName}</span>
            <span className="sidebar-user-role-badge">{roleTitle}</span>
          </div>
        </div>

        <div className="sidebar-bottom-actions">
          <NavLink
            to="/profile"
            end
            className={() =>
              `sidebar-bottom-btn ${location.pathname.startsWith('/profile') ? 'active' : ''}`
            }
            id="sidebar-link-my-profile"
            title="My Profile"
          >
            <User size={16} />
            <span>Profile</span>
          </NavLink>

          <NavLink
            to="/settings"
            end
            className={() =>
              `sidebar-bottom-btn ${location.pathname === '/settings' || location.pathname === '/profile/settings' ? 'active' : ''}`
            }
            id="sidebar-link-settings"
            title="Settings"
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            className="sidebar-bottom-btn logout-btn"
            id="sidebar-link-logout"
            onClick={handleLogout}
            title="Sign out of PeoplePay360"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
