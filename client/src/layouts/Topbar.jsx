import React, { useState } from 'react';
import { Search, Bell, User, KeyRound, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="topbar">
      <form onSubmit={handleSearch} className="search-bar">
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search employees, ID, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </form>

      <div className="topbar-actions">
        <div style={{ position: 'relative' }}>
          <button
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
            onClick={() => setShowMenu(!showMenu)}
          >
            <User size={14} />
            <span>{user?.firstName}</span>
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '8px',
                background: '#ffffff',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                width: '180px',
                zIndex: 100,
                overflow: 'hidden',
              }}
            >
              <div
                style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => { setShowMenu(false); navigate('/profile'); }}
              >
                <User size={14} /> Profile
              </div>
              <div
                style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={() => { setShowMenu(false); navigate('/security'); }}
              >
                <KeyRound size={14} /> Security
              </div>
              <div
                style={{ padding: '10px 14px', fontSize: '13px', cursor: 'pointer', borderTop: '1px solid var(--border-subtle)', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '8px' }}
                onClick={async () => {
                  setShowMenu(false);
                  await logout();
                  navigate('/login');
                }}
              >
                <LogOut size={14} /> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { Outlet } from 'react-router-dom';

export function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Topbar />
        <main className="content-body">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
