import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Building2, Shield } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          User Profile
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Account credentials, assigned roles, and organizational metadata.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '640px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', background: '#0f172a' }}>
            {user?.firstName?.[0] || 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>{user?.firstName} {user?.lastName}</h2>
            <div style={{ fontSize: '13.5px', color: '#64748b' }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Assigned System Role</div>
            <div style={{ fontWeight: 700, marginTop: '4px' }}>
              <span className="badge badge-info">{user?.role}</span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Tenant Organization</div>
            <div style={{ fontWeight: 600, marginTop: '4px' }}>{user?.organization?.name || 'Default Org'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          System Settings & Platform Info
        </h1>
      </div>

      <div className="card" style={{ maxWidth: '640px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>PeoplePay360 Stack</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Frontend Architecture</span>
            <strong>React 18 + Vite (JavaScript JSX, Vanilla CSS)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Backend Framework</span>
            <strong>Node.js + Express.js (JavaScript)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Database Engine</span>
            <strong>PostgreSQL 18.6 (Local) via Prisma ORM</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Authentication Scheme</span>
            <strong>Dual JWT (HttpOnly Access & Refresh Token Rotation)</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForbiddenPage() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#ef4444' }}>403</h1>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px' }}>Access Denied</h2>
      <p style={{ color: '#64748b', marginTop: '8px', maxWidth: '400px', margin: '8px auto 24px auto' }}>
        You do not have the required role permissions to view this resource.
      </p>
      <a href="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </a>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#0f172a' }}>404</h1>
      <h2 style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginTop: '8px', maxWidth: '400px', margin: '8px auto 24px auto' }}>
        The requested URL was not found on this server.
      </p>
      <a href="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </a>
    </div>
  );
}
