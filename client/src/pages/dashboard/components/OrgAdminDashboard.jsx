import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building,
  Clock,
  CalendarDays,
  Plus,
  ArrowUpRight,
  Landmark,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { AddEmployeeModal } from '../../../components/modals/AddEmployeeModal';
import '../../../styles/admin-dashboard.css';

export function OrgAdminDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const activities = data?.recentActivities || [];

  return (
    <div className="admin-dash-container" id="org-admin-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-welcome-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', marginBottom: '0.35rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669' }}></span>
            Organization Admin Portal
          </div>
          <h2 className="admin-welcome-title">Company Overview &amp; Workforce Control</h2>
          <p className="admin-welcome-sub">
            Real-time attendance, departments, active contracts, and payroll status.
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary-black"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/departments')}
            className="btn-secondary-clean"
          >
            <Building size={16} />
            <span>Departments</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/payroll')}
            className="btn-secondary-clean"
          >
            <Landmark size={16} />
            <span>Payroll</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Workforce</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.totalEmployees || 0}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-positive">
              <CheckCircle2 size={13} /> {summary.activeEmployees || 0} Active on Payroll
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Departments</span>
            <div className="admin-stat-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <Building size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.departmentsCount || 0}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Active business units</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Attendance Rate</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#059669' }}>{summary.attendanceRate || 0}%</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{summary.presentToday || 0} clocked in today</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Pending Leaves</span>
            <div className="admin-stat-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.pendingLeaveApprovals || 0}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-warning">
              <AlertCircle size={13} /> Action required
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Department Headcounts & Activity */}
      <div className="admin-grid-2col">
        {/* Department Breakdown */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Department Distribution</h3>
              <p className="admin-card-sub">Headcount distribution across company departments.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/departments')}
              className="btn-secondary-clean"
            >
              <span>Manage</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(charts.departmentHeadcounts || []).map((dept) => (
              <div key={dept.id || dept.name} style={{ padding: '0.85rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="table-avatar-pill">
                    {dept.code || dept.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{dept.name}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b' }}>Code: {dept.code || 'DEPT'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge-pill badge-pill-neutral">
                    {dept.employeeCount || 0} Employees
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activities */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Audit Trail</h3>
              <p className="admin-card-sub">Recent security &amp; data events</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/audit-logs')}
              className="btn-secondary-clean"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {activities.length > 0 ? (
              activities.slice(0, 6).map((log) => (
                <div key={log.id} className="alert-card-row" style={{ fontSize: '0.82rem' }}>
                  <div>
                    <strong style={{ color: '#0f172a' }}>{log.action}</strong>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      <span>{log.actor}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#94a3b8' }}>
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No recent activity logs.
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
}

