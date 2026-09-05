import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  CalendarDays,
  Clock,
  CheckSquare,
  Gift,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { AddEmployeeModal } from '../../../components/modals/AddEmployeeModal';
import '../../../styles/admin-dashboard.css';

export function HRManagerDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const summary = data?.summary || {};
  const newJoiners = data?.newJoinersList || [];
  const upcomingEvents = data?.upcomingEvents || [];

  return (
    <div className="admin-dash-container" id="hr-manager-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-welcome-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb', marginBottom: '0.35rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }}></span>
            HR &amp; People Operations
          </div>
          <h2 className="admin-welcome-title">Talent &amp; Workforce Lifecycle</h2>
          <p className="admin-welcome-sub">
            Manage employee onboarding, daily attendance, leave approvals, and talent compliance.
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn-primary-black"
          >
            <UserPlus size={16} />
            <span>Onboard Employee</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/leaves')}
            className="btn-secondary-clean"
          >
            <CheckSquare size={16} />
            <span>Leave Approvals</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/audit')}
            className="btn-secondary-clean"
          >
            <FileText size={16} />
            <span>HR Reports</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Headcount</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Users size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.employeeCount || 164}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-positive">
              <CheckCircle2 size={13} /> {summary.activeEmployees || 164} Active Employees
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">New Joiners (30d)</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <UserPlus size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#059669' }}>{summary.newJoiners || 12}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Recently inducted talent</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Pending Leaves</span>
            <div className="admin-stat-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.pendingLeaveRequests || 4}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-warning">
              <AlertCircle size={13} /> Awaiting HR sign-off
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Attendance Rate</span>
            <div className="admin-stat-icon-box" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#9333ea' }}>{summary.attendanceRate || 96}%</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{summary.employeesOnLeaveToday || 4} on approved leave</span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Onboarding Pipeline & Milestones */}
      <div className="admin-grid-2col">
        {/* New Joiners Table */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Employee Onboarding</h3>
              <p className="admin-card-sub">Employees added to the workforce lifecycle.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/employees')}
              className="btn-secondary-clean"
            >
              <span>Directory</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table-clean">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th style={{ textAlign: 'right' }}>Joining Date</th>
                </tr>
              </thead>
              <tbody>
                {newJoiners.length > 0 ? (
                  newJoiners.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="table-avatar-pill">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{emp.name}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#475569' }}>{emp.department}</td>
                      <td style={{ color: '#64748b' }}>{emp.jobTitle}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>
                        {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'Active'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>
                      No new joiners in the last 30 days.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Milestones & Celebrations */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gift size={18} style={{ color: '#d97706' }} />
              <h3 className="admin-card-title">Upcoming Milestones</h3>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((evt) => (
                <div key={evt.id} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: '#fffbeb', border: '1px solid #fef3c7' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.82rem' }}>{evt.name}</div>
                  <div style={{ color: '#b45309', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>{evt.type}</div>
                  <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.72rem', marginTop: '0.35rem' }}>
                    {evt.date ? new Date(evt.date).toLocaleDateString() : 'Upcoming'}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '1.5rem', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #f1f5f9', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No birthdays or work anniversaries scheduled this week.
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

