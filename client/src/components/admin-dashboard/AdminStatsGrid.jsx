import React from 'react';
import { Users, Clock, CalendarDays, Landmark, TrendingUp, AlertTriangle } from 'lucide-react';

export function AdminStatsGrid({ summary, onCardClick }) {
  if (!summary) return null;

  const totalEmployeesVal = typeof summary.totalEmployees === 'object' ? summary.totalEmployees.value : (summary.totalEmployees ?? 0);
  const totalEmployeesText = typeof summary.totalEmployees === 'object' ? summary.totalEmployees.changeText : `${summary.activeEmployees ?? totalEmployeesVal} active on roster`;
  const totalEmployeesTrend = typeof summary.totalEmployees === 'object' ? summary.totalEmployees.trend : 'Live Database';

  const presentTodayVal = typeof summary.presentToday === 'object' ? summary.presentToday.value : (summary.presentToday ?? 0);
  const attendanceRate = summary.attendanceRate ?? 100;
  const presentTodayText = typeof summary.presentToday === 'object' ? summary.presentToday.changeText : `${attendanceRate}% today's rate`;
  const presentTodayTrend = typeof summary.presentToday === 'object' ? summary.presentToday.trend : 'Verified';

  const pendingLeavesVal = typeof summary.pendingLeaves === 'object' ? summary.pendingLeaves.value : (summary.pendingLeaveApprovals ?? summary.pendingLeaves ?? 0);
  const pendingLeavesText = typeof summary.pendingLeaves === 'object' ? summary.pendingLeaves.changeText : 'Pending HR review';
  const pendingLeavesTrend = typeof summary.pendingLeaves === 'object' ? summary.pendingLeaves.trend : (pendingLeavesVal > 0 ? 'Requires Action' : 'All Clear');

  const payrollStatusVal = typeof summary.payrollStatus === 'object' ? summary.payrollStatus.status : (summary.currentPayrollStatus || 'READY_TO_RUN');
  const payrollCycle = typeof summary.payrollStatus === 'object' ? summary.payrollStatus.cycle : 'Current Cycle';
  const payrollText = typeof summary.payrollStatus === 'object' ? summary.payrollStatus.changeText : (summary.latestPayrunNet ? `₹${Number(summary.latestPayrunNet).toLocaleString('en-IN')} net` : 'No active run');

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
        <div className="admin-stat-val">{totalEmployeesVal}</div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#64748b' }}>{totalEmployeesText}</span>
          <span className="trend-badge-pill trend-positive">
            <TrendingUp size={12} />
            {totalEmployeesTrend}
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
          {presentTodayVal}
        </div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#64748b' }}>{presentTodayText}</span>
          <span className="trend-badge-pill trend-positive">
            <TrendingUp size={12} />
            {presentTodayTrend}
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
          {pendingLeavesVal}
        </div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#b45309' }}>{pendingLeavesText}</span>
          <span className={`trend-badge-pill ${pendingLeavesVal > 0 ? 'trend-warning' : 'trend-positive'}`}>
            <AlertTriangle size={12} />
            {pendingLeavesTrend}
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
          <span className="admin-stat-label">{payrollCycle}</span>
          <div className="admin-stat-icon-box" style={{ background: '#f1f5f9', color: '#334155' }}>
            <Landmark size={18} />
          </div>
        </div>
        <div className="admin-stat-val" style={{ fontSize: '1.25rem', color: '#0f172a' }}>
          {payrollStatusVal}
        </div>
        <div className="admin-stat-bottom">
          <span style={{ color: '#64748b' }}>{payrollText}</span>
          <span className="trend-badge-pill trend-neutral">
            PostgreSQL DB
          </span>
        </div>
      </div>
    </div>
  );
}
