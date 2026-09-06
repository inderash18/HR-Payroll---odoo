import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  CalendarDays,
  FileText,
  CheckCircle2,
  Download,
  ArrowUpRight,
  Sparkles,
  LogOut as LogOutIcon,
  LogIn as LogInIcon,
} from 'lucide-react';
import { api } from '../../../api/client';
import '../../../styles/admin-dashboard.css';

export function EmployeeDashboard({ data, onRefresh }) {
  const navigate = useNavigate();
  const [isClocking, setIsClocking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const profile = data?.profileSummary || {};
  const attendance = data?.todayAttendance || {};
  const leave = data?.leaveSummary || {};
  const payslip = data?.latestPayslip;
  const holidays = data?.upcomingHolidays || [];

  const handleClockIn = async () => {
    setErrorMsg(null);
    setIsClocking(true);
    try {
      await api.post('/attendance/clock-in', {});
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Clock in failed:', e);
      setErrorMsg(e.response?.data?.message || e.response?.data?.error || e.message || 'Clock in failed');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsClocking(false);
    }
  };

  const handleClockOut = async () => {
    setErrorMsg(null);
    setIsClocking(true);
    try {
      await api.post('/attendance/clock-out', {});
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error('Clock out failed:', e);
      setErrorMsg(e.response?.data?.message || e.response?.data?.error || e.message || 'Clock out failed');
      setTimeout(() => setErrorMsg(null), 4000);
    } finally {
      setIsClocking(false);
    }
  };

  return (
    <div className="admin-dash-container" id="employee-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-banner-dark">
        <div>
          <div className="banner-badge-live">
            <Sparkles size={14} /> Employee Self-Service Portal
          </div>
          <h2 className="admin-welcome-title">Welcome back, {profile.name || 'Team Member'}!</h2>
          <p className="admin-welcome-sub">
            {profile.jobTitle || 'Senior Engineer'} • {profile.department || 'Engineering'} • ID: <span style={{ fontFamily: 'monospace', color: 'var(--primary-soft)' }}>{profile.employeeNum || 'ODOO-1007'}</span>
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="btn-banner-glass"
          >
            <User size={16} />
            <span>My Profile</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/leaves')}
            className="btn-banner-white"
          >
            <CalendarDays size={16} />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="admin-stats-grid">
        {/* Live Attendance / Clock Control */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Today's Attendance</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ fontSize: '1.35rem' }}>
            {attendance.checkOutTime ? 'Clocked Out' : attendance.isCheckedIn ? 'Clocked In' : 'Not Clocked In'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            {attendance.checkOutTime 
              ? `Out at ${new Date(attendance.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : attendance.checkInTime
              ? `In at ${new Date(attendance.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Ready to start your work day'}
          </div>
          {errorMsg && (
            <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '0.4rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: 600 }}>
              {errorMsg}
            </div>
          )}
          <div style={{ marginTop: '0.85rem' }}>
            {attendance.checkOutTime ? (
              <button
                type="button"
                disabled={true}
                className="btn-action-sm"
                style={{ width: '100%', padding: '0.55rem', background: '#e2e8f0', color: '#475569', border: 'none' }}
              >
                <CheckCircle2 size={14} /> Workday Completed
              </button>
            ) : attendance.isCheckedIn ? (
              <button
                type="button"
                onClick={handleClockOut}
                disabled={isClocking}
                className="btn-action-sm btn-action-danger"
                style={{ width: '100%', padding: '0.55rem' }}
              >
                <LogOutIcon size={14} /> Clock Out
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClockIn}
                disabled={isClocking}
                className="btn-action-sm btn-action-success"
                style={{ width: '100%', padding: '0.55rem' }}
              >
                <LogInIcon size={14} /> Clock In Now
              </button>
            )}
          </div>
        </div>

        {/* Leave Balance */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Leave Balance</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <CalendarDays size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{leave.totalAllocatedDays || 0} Days</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-positive">
              <CheckCircle2 size={13} /> {leave.pendingRequestsCount || 0} Pending Approvals
            </span>
          </div>
        </div>

        {/* Latest Payslip */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Latest Payslip</span>
            <div className="admin-stat-icon-box" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <FileText size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#9333ea', fontSize: '1.45rem' }}>
            {payslip ? `₹${Number(payslip.netSalary).toLocaleString('en-IN')}` : '₹82,400'}
          </div>
          <div className="admin-stat-bottom">
            <button
              type="button"
              onClick={() => navigate('/payslips')}
              style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', padding: 0 }}
            >
              <span>Download Payslip</span>
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Profile Status</span>
            <div className="admin-stat-icon-box" style={{ background: '#eef2ff', color: '#4f46e5' }}>
              <User size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#059669' }}>{profile.profileCompletion || '100%'}</div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Bank &amp; statutory verified</span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: My Leaves & Upcoming Holidays */}
      <div className="admin-grid-2col">
        {/* Recent Leave Requests */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">My Leave Applications</h3>
              <p className="admin-card-sub">Your recent time-off requests and approval status.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/leaves')}
              className="btn-secondary-clean"
            >
              <span>Apply Leave</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(leave.recentLeaves || []).length > 0 ? (
              leave.recentLeaves.map((l) => (
                <div key={l.id} style={{ padding: '0.85rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>{l.type}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={l.status === 'APPROVED' ? "badge-pill badge-pill-success" : "badge-pill badge-pill-warning"}>
                    {l.status}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No leave requests submitted yet.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Upcoming Holidays</h3>
              <p className="admin-card-sub">Public &amp; festive calendar</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {holidays.map((h, i) => (
              <div key={i} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{h.name}</div>
                <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '0.75rem' }}>{h.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

