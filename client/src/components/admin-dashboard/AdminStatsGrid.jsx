import React from 'react';
import { Users, Clock, CalendarDays, Landmark, TrendingUp, AlertTriangle } from 'lucide-react';

export function AdminStatsGrid({ summary, onCardClick }) {
  if (!summary) return null;

  return (
    <div className="admin-stats-grid" id="admin-kpi-stats-grid">
      {/* 1. Total Employees */}
      <div
        className="admin-stat-card"
        id="kpi-total-employees"
        onClick={() => onCardClick && onCardClick('employees')}
      >
        <div className="admin-stat-top">
          <span className="admin-stat-label">Total Employees</span>
          <div className="admin-stat-icon-box" style={{ background: '#f8fafc', color: '#0f172a' }}>
            <Users size={18} />
          </div>
        </div>
        <div className="admin-stat-val">{summary.totalEmployees.value}</div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#64748b' }}>{summary.totalEmployees.changeText}</span>
          <span className="trend-badge-pill trend-positive">
            <TrendingUp size={12} />
            {summary.totalEmployees.trend}
          </span>
        </div>
      </div>

      {/* 2. Present Today */}
      <div
        className="admin-stat-card"
        id="kpi-present-today"
        onClick={() => onCardClick && onCardClick('attendance')}
      >
        <div className="admin-stat-top">
          <span className="admin-stat-label">Present Today</span>
          <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#047857' }}>
            <Clock size={18} />
          </div>
        </div>
        <div className="admin-stat-val" style={{ color: '#047857' }}>
          {summary.presentToday.value}
        </div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#64748b' }}>{summary.presentToday.changeText}</span>
          <span className="trend-badge-pill trend-positive">
            <TrendingUp size={12} />
            {summary.presentToday.trend}
          </span>
        </div>
      </div>

      {/* 3. Pending Leave Requests */}
      <div
        className="admin-stat-card"
        id="kpi-pending-leaves"
        onClick={() => onCardClick && onCardClick('leaves')}
      >
        <div className="admin-stat-top">
          <span className="admin-stat-label">Pending Leaves</span>
          <div className="admin-stat-icon-box" style={{ background: '#fffbeb', color: '#b45309' }}>
            <CalendarDays size={18} />
          </div>
        </div>
        <div className="admin-stat-val" style={{ color: '#b45309' }}>
          {summary.pendingLeaves.value}
        </div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#b45309' }}>{summary.pendingLeaves.changeText}</span>
          <span className="trend-badge-pill trend-warning">
            <AlertTriangle size={12} />
            {summary.pendingLeaves.trend}
          </span>
        </div>
      </div>

      {/* 4. Payroll Status */}
      <div
        className="admin-stat-card"
        id="kpi-payroll-status"
        onClick={() => onCardClick && onCardClick('payroll')}
      >
        <div className="admin-stat-top">
          <span className="admin-stat-label">{summary.payrollStatus.cycle}</span>
          <div className="admin-stat-icon-box" style={{ background: '#f1f5f9', color: '#334155' }}>
            <Landmark size={18} />
          </div>
        </div>
        <div className="admin-stat-val" style={{ fontSize: '1.45rem', color: '#0f172a' }}>
          {summary.payrollStatus.status}
        </div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#64748b' }}>{summary.payrollStatus.changeText}</span>
          <span className="trend-badge-pill trend-neutral">
            {summary.payrollStatus.trend}
          </span>
        </div>
      </div>
    </div>
  );
}
