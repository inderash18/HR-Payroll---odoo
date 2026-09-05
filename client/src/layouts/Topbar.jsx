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
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Sidebar } from './Sidebar';

export function Topbar() {
  const { user, logout } = useAuth();
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
    if (path.startsWith('/security') || path.startsWith('/sessions')) return 'Account Security';
    if (path.startsWith('/profile')) return 'User Profile';
    if (path.startsWith('/settings')) return 'System Settings';
    return 'PeoplePay360';
  };

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Administrator';
  const initials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'AD';
  const roleLabel = (user?.role || 'ADMIN').replace(/_/g, ' ');

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
      else if (q.includes('sec') || q.includes('pass')) navigate('/security');
      else if (q.includes('sess')) navigate('/security');
      else if (q.includes('prof')) navigate('/profile');
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
      <h1 className="topbar-title" id="header-tab-title">
        {getPageTitle(location.pathname)}
      </h1>

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
            <div className="user-avatar-initials">{initials}</div>
            <span className="user-profile-name">{displayName}</span>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: '-2px' }} />
          </div>

          <div className={`profile-dropdown-menu ${dropdownOpen ? 'show' : ''}`} id="profile-dropdown-menu">
            <div className="dropdown-user-header">
              <div className="dropdown-user-name">{displayName}</div>
              <div className="dropdown-user-email">{user?.email || 'admin@peoplepay360.local'}</div>
              <span className="dropdown-user-role">{roleLabel}</span>
            </div>
            <div className="dropdown-nav-list">
              <div
                className="dropdown-nav-item"
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
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/security');
                }}
              >
                <Shield size={16} />
                <span>Account Security</span>
              </div>
              <div
                className="dropdown-nav-item"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/security');
                }}
              >
                <Laptop size={16} />
                <span>Active Sessions</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-nav-item logout-danger" onClick={handleLogout}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppLayout({ children }) {
  return (
    <div id="app" className="app-shell">
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
