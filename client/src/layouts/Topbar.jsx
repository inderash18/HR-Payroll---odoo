import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  User,
  Shield,
  Laptop,
  LogOut,
  KeyRound,
  Settings,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';

import { useLayout } from '../contexts/LayoutContext';
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react';

export function Topbar() {
  const { user, logout } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);

  const getPageTitle = (path) => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/employees/')) return 'Employee Details';
    if (path.startsWith('/employees')) return 'Workforce Directory';
    if (path.startsWith('/departments')) return 'Departments';
    if (path.startsWith('/contracts')) return 'Employment Contracts';
    if (path.startsWith('/schedules')) return 'Working Schedules';
    if (path.startsWith('/attendance')) return 'Attendance & Clocking';
    if (path.startsWith('/leaves')) return 'Leaves & Time Off';
    if (path.startsWith('/payroll/payruns/')) return 'Payroll Payrun Batch';
    if (path.startsWith('/payroll')) return 'Payroll Batches';
    if (path.startsWith('/payslips/')) return 'Employee Payslip';
    if (path.startsWith('/payslips')) return 'Payslip Management';
    if (path.startsWith('/users')) return 'User Access Management';
    if (path.startsWith('/audit')) return 'Audit & Security Logs';
    if (path.startsWith('/security') || path.startsWith('/sessions') || path.startsWith('/profile/security')) return 'Account Security';
    if (path.startsWith('/profile')) return 'User Profile';
    if (path.startsWith('/settings')) return 'System Settings';
    return 'PeoplePay360';
  };

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator';
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'AD';
  const roleLabel = (user?.role || 'ADMIN').replace(/_/g, ' ');
  const employeeId = user?.employee?.employeeNum || user?.employeeNum || 'EMP-PP360';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = searchValue.trim().toLowerCase();
      if (q.includes('emp')) navigate('/employees');
      else if (q.includes('dept')) navigate('/departments');
      else if (q.includes('pay') || q.includes('run')) navigate('/payroll');
      else if (q.includes('slip')) navigate('/payslips');
      else if (q.includes('leave') || q.includes('time')) navigate('/leaves');
      else if (q.includes('attend')) navigate('/attendance');
      else if (q.includes('user')) navigate('/users');
      else if (q.includes('sec') || q.includes('pass')) navigate('/profile/security');
      else if (q.includes('sess')) navigate('/profile/security');
      else if (q.includes('prof')) navigate('/profile');
      else if (q.includes('doc')) navigate('/profile/documents');
      else if (q.includes('audit') || q.includes('log')) navigate('/audit');
      else if (q.includes('set')) navigate('/settings');
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar-clean">
      <div className="topbar-left-group">
        <button
          type="button"
          className="btn-toggle-sidebar"
          id="btn-toggle-sidebar"
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? "Show Sidebar (Ctrl + B)" : "Hide Sidebar (Ctrl + B)"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
        </button>
        <h1 className="topbar-title" id="header-tab-title">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="topbar-center">
        <div className="search-pill-box">
          <Search size={17} />
          <input
            type="text"
            id="topbar-global-search"
            placeholder="Search across PeoplePay360..."
            autoComplete="off"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>

      <div className="topbar-right">
        <button
          className="action-pill-btn"
          id="btn-quick-add"
          title="Quick Add"
          onClick={() => navigate('/employees')}
        >
          <Plus size={18} />
        </button>

        <button
          className="topbar-icon-btn"
          id="btn-topbar-notifications"
          title="Notifications"
          onClick={() => {}}
        >
          <Bell size={20} />
          <span className="badge-dot"></span>
        </button>

        {/* Profile Pill & Floating SaaS Dropdown */}
        <div className="profile-dropdown-container" ref={dropdownRef}>
          <div
            className="user-profile-pill"
            id="user-profile-menu-trigger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
              />
            ) : (
              <div className="user-avatar-initials">{initials}</div>
            )}
            <span className="user-profile-name">{displayName}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '-2px' }} />
          </div>

          <div className={`profile-dropdown-menu ${dropdownOpen ? 'show' : ''}`} id="profile-dropdown-menu">
            <div className="dropdown-user-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff' }}
                  />
                ) : (
                  <div className="user-avatar-initials" style={{ width: 40, height: 40, fontSize: '0.95rem' }}>
                    {initials}
                  </div>
                )}
                <div>
                  <div className="dropdown-user-name">{displayName}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    ID: {employeeId}
                  </div>
                </div>
              </div>
              <div className="dropdown-user-email">{user?.email || 'admin@peoplepay360.local'}</div>
              <span className="dropdown-user-role">{roleLabel}</span>
            </div>
            <div className="dropdown-nav-list">
              <div
                className="dropdown-nav-item"
                id="dropdown-my-profile"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
              >
                <User size={16} />
                <span>My Profile</span>
              </div>
              <div
                className="dropdown-nav-item"
                id="dropdown-account-settings"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
              >
                <Settings size={16} />
                <span>Account Settings</span>
              </div>
              <div
                className="dropdown-nav-item"
                id="dropdown-change-password"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile/security');
                }}
              >
                <KeyRound size={16} />
                <span>Change Password</span>
              </div>
              <div
                className="dropdown-nav-item"
                id="dropdown-active-sessions"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile/security');
                }}
              >
                <Laptop size={16} />
                <span>Active Sessions</span>
              </div>
              <div className="dropdown-divider"></div>
              <div
                className="dropdown-nav-item logout-danger"
                id="dropdown-logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppLayout({ children }) {
  const { isSidebarCollapsed } = useLayout();

  return (
    <div id="app" className={`app-shell ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <main className="main-canvas">
        <Topbar />
        <div className="view-scroll-content" id="tab-content">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
