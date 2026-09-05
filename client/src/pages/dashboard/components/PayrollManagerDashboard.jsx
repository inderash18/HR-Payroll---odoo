import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Landmark,
  Play,
  FileText,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import '../../../styles/admin-dashboard.css';

export function PayrollManagerDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const payrollHistory = data?.payrollHistory || [];
  const recentPayslips = data?.recentPayslips || [];

  return (
    <div className="admin-dash-container" id="payroll-manager-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-welcome-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', marginBottom: '0.35rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669' }}></span>
            Payroll &amp; Compensation Hub
          </div>
          <h2 className="admin-welcome-title">Payroll Processing Engine</h2>
          <p className="admin-welcome-sub">
            Calculate earnings, deductions, generate payslips, and dispatch bank payment files.
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => navigate('/payroll')}
            className="btn-primary-black"
          >
            <Play size={16} />
            <span>New Payrun Batch</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/payslips')}
            className="btn-secondary-clean"
          >
            <FileText size={16} />
            <span>Payslips Management</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/contracts')}
            className="btn-secondary-clean"
          >
            <Layers size={16} />
            <span>Salary Structures</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Payroll Cycle Status</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Landmark size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ fontSize: '1.45rem' }}>{summary.payrollCycleStatus || 'READY_TO_RUN'}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-positive">
              <CheckCircle2 size={13} /> {summary.employeesReadyForPayroll || 0} Contracts Ready
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Gross Salary</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#059669', fontSize: '1.45rem' }}>
            ₹{Number(summary.grossSalaryAmount || 0).toLocaleString('en-IN')}
          </div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Current cycle gross computation</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Net Payable</span>
            <div className="admin-stat-icon-box" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <Landmark size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#9333ea', fontSize: '1.45rem' }}>
            ₹{Number(summary.netPayrollPayable || 0).toLocaleString('en-IN')}
          </div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>After statutory deductions</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Missing Bank/Tax</span>
            <div className="admin-stat-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.missingBankInfoCount || 0}</div>
          <div className="admin-stat-bottom">
            <span className={summary.missingBankInfoCount > 0 ? "trend-badge-pill trend-warning" : "trend-badge-pill trend-positive"}>
              {summary.missingBankInfoCount > 0 ? 'Requires action' : 'All accounts verified'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Payrun History & Recent Payslips */}
      <div className="admin-grid-2col">
        {/* Payrun Batches */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Payroll Payrun Batches</h3>
              <p className="admin-card-sub">Recent compensation calculation batches.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/payroll')}
              className="btn-secondary-clean"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {payrollHistory.length > 0 ? (
              payrollHistory.map((run) => (
                <div key={run.id} style={{ padding: '0.85rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{run.name}</div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748b', marginTop: '0.15rem' }}>
                      {new Date(run.startDate).toLocaleDateString()} – {new Date(run.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>
                      ₹{Number(run.totalNet || 0).toLocaleString('en-IN')}
                    </div>
                    <span className="badge-pill badge-pill-success" style={{ marginTop: '0.2rem' }}>
                      {run.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No payruns calculated yet. Click "New Payrun Batch" to process payroll.
              </div>
            )}
          </div>
        </div>

        {/* Recent Payslips */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Generated Payslips</h3>
              <p className="admin-card-sub">Latest employee pay slips</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/payslips')}
              className="btn-secondary-clean"
            >
              <span>All Payslips</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentPayslips.length > 0 ? (
              recentPayslips.map((ps) => (
                <div key={ps.id} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{ps.employeeName}</div>
                    <div style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.72rem' }}>{ps.employeeNum}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>
                    ₹{Number(ps.netSalary).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No payslips generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

