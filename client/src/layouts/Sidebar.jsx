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
      {/* BRAND HEADER */}
      <div className="sidebar-header-wrapper">
        <div
          className="sidebar-brand-container"
          id="sidebar-brand-header"
          onClick={() => navigate('/dashboard')}
        >
          <div className="sidebar-brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 12C4 7.58 7.58 4 12 4C15.37 4 18.28 6.09 19.45 9"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M20 12C20 16.42 16.42 20 12 20C8.63 20 5.72 17.91 4.55 15"
                stroke="#38BDF8"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M9.5 8.5H13.2C14.47 8.5 15.5 9.53 15.5 10.8C15.5 12.07 14.47 13.1 13.2 13.1H9.5V16.5"
                stroke="#FFFFFF"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="19.5" cy="9" r="1.5" fill="#38BDF8" />
              <circle cx="4.5" cy="15" r="1.5" fill="#FFFFFF" />
            </svg>
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">PeoplePay360</span>
            <span className="sidebar-brand-sub">ENTERPRISE HR &amp; PAYROLL</span>
          </div>
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

