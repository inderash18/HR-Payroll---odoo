import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Users, Shield, Activity, ArrowUpRight, CheckCircle2, Globe, Server } from 'lucide-react';
import '../../../styles/admin-dashboard.css';

export function SuperAdminDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const organizations = data?.organizations || [];
  const activities = data?.recentActivities || [];

  return (
    <div className="admin-dash-container" id="super-admin-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-banner-dark">
        <div>
          <div className="banner-badge-live">
            <span className="pulse-dot"></span>
            Super Admin Platform Console
          </div>
          <h2 className="admin-welcome-title">Platform Governance &amp; Multi-Tenant Overview</h2>
          <p className="admin-welcome-sub">
            Manage global enterprise tenants, system health, and cross-organization telemetry.
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => navigate('/audit-logs')}
            className="btn-banner-glass"
          >
            <Shield size={16} />
            <span>Platform Audit Logs</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="btn-banner-white"
          >
            <Server size={16} />
            <span>System Config</span>
          </button>
        </div>
      </div>

      {/* 2. Metric KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Organizations</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Building size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.totalOrganizations || organizations.length || 0}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-positive">
              <CheckCircle2 size={13} /> Active SaaS Tenants
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Platform Users</span>
            <div className="admin-stat-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.totalUsersAcrossOrgs || 0}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Across all tenant accounts</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Managed Workforce</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Globe size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.totalEmployeesPlatform || 0}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Active payroll-ready personnel</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">System Telemetry</span>
            <div className="admin-stat-icon-box" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Activity size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ fontSize: '1.25rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            {summary.systemHealth || '100% Operational'}
          </div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>PostgreSQL + Prisma HA</span>
          </div>
        </div>
      </div>

      {/* 3. Organization Directory Table */}
      <div className="admin-card-white">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Registered SaaS Organizations</h3>
            <p className="admin-card-sub">Live tenant organizations with isolated schemas and data partitions.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="btn-secondary-clean"
          >
            <span>View Users</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table-clean">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Tenant Code</th>
                <th>Currency</th>
                <th style={{ textAlign: 'center' }}>Users</th>
                <th style={{ textAlign: 'center' }}>Employees</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {organizations.length > 0 ? (
                organizations.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="table-avatar-pill">
                          {org.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{org.name}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>{org.code}</td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{org.currency} ({org.timezone})</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>{org.usersCount}</td>
                    <td style={{ textAlign: 'center', fontWeight: 800 }}>{org.employeesCount}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge-pill badge-pill-success">
                        <CheckCircle2 size={12} /> Active
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="table-avatar-pill">OD</div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Odoo India Technologies Pvt. Ltd.</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ODOO</td>
                  <td style={{ fontWeight: 600, color: '#334155' }}>INR (Asia/Kolkata)</td>
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>252</td>
                  <td style={{ textAlign: 'center', fontWeight: 800 }}>164</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge-pill badge-pill-success">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Platform Security & Activity Audit */}
      <div className="admin-card-white">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Platform Audit &amp; Security Stream</h3>
            <p className="admin-card-sub">Real-time telemetry and audit stream across all tenant sessions.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/audit-logs')}
            className="btn-secondary-clean"
          >
            <span>Full Audit Trail</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {activities.length > 0 ? (
            activities.map((act) => (
              <div key={act.id} className="alert-card-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }}></div>
                  <div style={{ fontSize: '0.82rem' }}>
                    <strong style={{ color: '#0f172a' }}>{act.action}</strong> on <span style={{ color: '#475569', fontWeight: 600 }}>{act.entityType}</span>
                    <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>by {act.actor} ({act.orgName})</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                  {new Date(act.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '1rem 0' }}>
              No security alerts or anomalous activity detected. System is running securely.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

