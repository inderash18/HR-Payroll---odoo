import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNavigationForRole } from '../config/navigation.config';
import { useLayout } from '../contexts/LayoutContext';

export function Sidebar() {
  const { user } = useAuth();
  const { isSidebarCollapsed } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const visibleLinks = getNavigationForRole(user?.role);

  // Group links by section for clean information hierarchy
  let currentSection = null;

  return (
    <aside className={`sidebar-dark ${isSidebarCollapsed ? 'collapsed' : ''}`} id="main-application-sidebar">
      {/* BRAND HEADER & WORKSPACE */}
      <div className="sidebar-header-wrapper">
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
    </aside>
  );
}

