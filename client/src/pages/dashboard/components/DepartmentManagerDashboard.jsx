import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  CalendarDays,
  CheckSquare,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
} from 'lucide-react';
import { api } from '../../../api/client';
import '../../../styles/admin-dashboard.css';

export function DepartmentManagerDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const teamMembers = data?.teamMembersList || [];
  const pendingApprovals = data?.pendingApprovals || [];
  const departmentName = data?.departmentName || 'My Team';

  const handleApproveLeave = async (leaveId) => {
    try {
      await api.post(`/leaves/requests/${leaveId}/approve`);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Failed to approve leave:', e);
    }
  };

  const handleRejectLeave = async (leaveId) => {
    try {
      await api.post(`/leaves/requests/${leaveId}/reject`);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Failed to reject leave:', e);
    }
  };

  return (
    <div className="admin-dash-container" id="dept-manager-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-welcome-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', marginBottom: '0.35rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669' }}></span>
            Department Team Portal
          </div>
          <h2 className="admin-welcome-title">{departmentName} — Team Operations</h2>
          <p className="admin-welcome-sub">
            Manage daily roster attendance and review team member leave requests.
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => navigate('/leaves')}
            className="btn-primary-black"
          >
            <CheckSquare size={16} />
            <span>Approve Team Leaves</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/attendance')}
            className="btn-secondary-clean"
          >
            <Clock size={16} />
            <span>Team Attendance</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Team Size</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.teamSize || teamMembers.length || 0}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Assigned department members</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Present Today</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#059669' }}>{summary.presentToday || 0}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-positive">
              {summary.teamAttendanceRate || 0}% attendance rate
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">On Leave Today</span>
            <div className="admin-stat-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.onLeaveToday || 0}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Approved time off</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Pending Approvals</span>
            <div className="admin-stat-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <CheckSquare size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.pendingLeaveApprovals || pendingApprovals.length || 0}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-warning">
              <AlertCircle size={13} /> Requires decision
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Team Members & Leave Requests */}
      <div className="admin-grid-2col">
        {/* Team Members List */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Department Team Members</h3>
              <p className="admin-card-sub">Direct reports in {departmentName}.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="btn-secondary-clean"
            >
              <span>View Team</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {teamMembers.length > 0 ? (
              teamMembers.map((emp) => (
                <div key={emp.id} style={{ padding: '0.75rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="table-avatar-pill">
                      {emp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.title} • {emp.email}</div>
                    </div>
                  </div>
                  <span className="badge-pill badge-pill-success">
                    Active
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No direct team members assigned to your department.
              </div>
            )}
          </div>
        </div>

        {/* Leave Requests Queue */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Pending Leave Requests</h3>
              <p className="admin-card-sub">Team approval queue</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((l) => (
                <div key={l.id} style={{ padding: '0.85rem 1rem', borderRadius: '0.85rem', background: '#fffbeb', border: '1px solid #fef3c7', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ color: '#0f172a' }}>{l.employeeName}</strong>
                    <span className="badge-pill badge-pill-warning">
                      {l.leaveType}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                    {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()} ({l.durationDays} days)
                  </div>
                  {l.reason && <div style={{ fontSize: '0.75rem', fontStyle: 'italic', color: '#475569', marginBottom: '0.65rem' }}>"{l.reason}"</div>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleApproveLeave(l.id)}
                      className="btn-action-sm btn-action-dark"
                      style={{ flex: 1 }}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectLeave(l.id)}
                      className="btn-action-sm btn-action-subtle"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No pending leave approvals for your department.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

