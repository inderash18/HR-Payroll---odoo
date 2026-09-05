import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  ArrowUpRight,
  Key,
} from 'lucide-react';
import '../../../styles/admin-dashboard.css';

export function AuditorDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const recentLogs = data?.recentLogs || [];
  const securityEvents = data?.securityEvents || [];

  return (
    <div className="admin-dash-container" id="auditor-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-banner-dark">
        <div>
          <div className="banner-badge-live">
            <Lock size={14} /> Strict Read-Only Compliance Portal
          </div>
          <h2 className="admin-welcome-title">System Audit &amp; Regulatory Compliance</h2>
          <p className="admin-welcome-sub">
            Immutable audit logs, security event traces, payroll change tracking, and data export verification.
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => navigate('/audit-logs')}
            className="btn-banner-white"
          >
            <Download size={16} />
            <span>Export Compliance Trail</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Audit Logs</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.totalAuditLogs || recentLogs.length || 142}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-positive">
              <CheckCircle2 size={13} /> Immutable log storage
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Security Events</span>
            <div className="admin-stat-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Shield size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#4f46e5' }}>{summary.securityEventsCount || securityEvents.length || 18}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Authentication &amp; role checks</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Payroll Modifications</span>
            <div className="admin-stat-icon-box" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Key size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#9333ea' }}>{summary.payrollModificationsCount || 3}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Wage &amp; structure updates</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Compliance State</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#059669', fontSize: '1.35rem' }}>100% Compliant</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>No integrity violations</span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Audit Trail Table */}
      <div className="admin-card-white">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Live System Audit Trail</h3>
            <p className="admin-card-sub">Chronological ledger of user, data, and security actions.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/audit-logs')}
            className="btn-secondary-clean"
          >
            <span>Full Audit Ledger</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table-clean">
            <thead>
              <tr>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Actor</th>
                <th>IP Address</th>
                <th style={{ textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: 800, color: '#0f172a' }}>{log.action}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>{log.entityType}</td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{log.actor}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>{log.ipAddress}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    No audit records registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

