import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const role = (user?.role || 'ADMIN').replace(/_/g, ' ');
  const initial1 = user?.firstName ? user.firstName.charAt(0) : 'U';
  const initial2 = user?.lastName ? user.lastName.charAt(0) : '';

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
            }}
          >
            {initial1}
            {initial2}
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{displayName}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
              {user?.email || 'N/A'}
            </p>
            <span className="badge blue" style={{ marginTop: '0.5rem' }}>
              {role}
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
          }}
        >
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Organization</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {user?.organization?.name || 'Indian Enterprise Corp'} ({user?.organization?.code || 'PP360-IND'})
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>User ID</span>
            <span style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'monospace', marginTop: '0.2rem' }}>
              {user?.id || 'dev-fixed-admin-id'}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Account Role</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {role}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Authentication Mode</span>
            <span style={{ display: 'block', marginTop: '0.2rem' }}>
              <span className="badge green">SECURE REFRESH COOKIE</span>
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Manage Account Security</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Update your password or manage active devices
          </p>
        </div>
        <button
          className="btn-pill-primary"
          id="btn-goto-security"
          onClick={() => navigate('/security')}
        >
          <Shield size={16} />
          <span>Security Settings</span>
        </button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { user } = useAuth();
  const displayName = `${user?.firstName || 'System'} ${user?.lastName || 'Administrator'}`.trim();
  const initial1 = user?.firstName?.charAt(0) || 'S';
  const initial2 = user?.lastName?.charAt(0) || 'A';

  return (
    <div style={{ maxWidth: '700px' }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
          User Profile & Session
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {initial1}
            {initial2}
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>{displayName}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {user?.email || 'admin@peoplepay360.local'}
            </p>
            <span className="badge blue" style={{ marginTop: '0.5rem' }}>
              {(user?.role || 'ADMIN').replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          System Information
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <strong>Database:</strong> PostgreSQL 18.6 (localhost:5432, db: peoplepay360)
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <strong>Security:</strong> Express Helmet + HttpOnly Cookie Auth + SafeMathParser AST Engine
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <strong>API Prefix:</strong> <code>/api/v1</code> (All REST API endpoints returning standardized JSON)
        </p>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page-container">
      <div className="error-icon-shield">
        <ShieldAlert size={36} />
      </div>
      <h2 className="error-page-title">Access Denied (403)</h2>
      <p className="error-page-desc">
        Your assigned RBAC role does not possess permissions to view or mutate this resource. Contact your system
        administrator if this is unexpected.
      </p>
      <div className="error-page-actions">
        <button className="btn-pill-primary" onClick={() => navigate('/dashboard')}>
          <Home size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page-container">
      <div className="error-icon-shield" style={{ background: '#eff6ff', color: '#2563eb' }}>
        <ShieldAlert size={36} />
      </div>
      <h2 className="error-page-title">Resource Not Found (404)</h2>
      <p className="error-page-desc">
        The route or entity requested does not exist or may have been migrated.
      </p>
      <div className="error-page-actions">
        <button className="btn-pill-primary" onClick={() => navigate('/dashboard')}>
          <Home size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}
