import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getNavigationForRole } from '../config/navigation.config';
import { useLayout } from '../contexts/LayoutContext';
import { OdooLogo } from '../components/common/OdooLogo';

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
            <OdooLogo size={26} color="#714B67" />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-title">Odoo</span>
            <span className="sidebar-brand-sub">WORKFORCE PLATFORM</span>
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
