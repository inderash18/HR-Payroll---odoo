import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CheckCircle,
  Clock,
  PieChart,
  Download,
  Building,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import '../../../styles/admin-dashboard.css';

export function FinanceManagerDashboard({ data }) {
  const navigate = useNavigate();
  const summary = data?.summary || {};
  const costBreakdown = data?.departmentCostBreakdown || [];
  const recentPayslips = data?.recentPaidPayslips || [];

  return (
    <div className="admin-dash-container" id="finance-manager-dashboard-root">
      {/* 1. Header Banner */}
      <div className="admin-welcome-card">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#059669', marginBottom: '0.35rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669' }}></span>
            Finance &amp; Compensation Audit
          </div>
          <h2 className="admin-welcome-title">Financial Payroll Approvals &amp; Cost Analysis</h2>
          <p className="admin-welcome-sub">
            Approve payroll runs, review cost centers, and reconcile tax and statutory deductions.
          </p>
        </div>
        <div className="admin-welcome-actions">
          <button
            type="button"
            onClick={() => navigate('/payroll')}
            className="btn-primary-black"
          >
            <CheckCircle size={16} />
            <span>Review &amp; Approve Payruns</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/audit')}
            className="btn-secondary-clean"
          >
            <Download size={16} />
            <span>Export Financials</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Total Payroll Expense</span>
            <div className="admin-stat-icon-box" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ fontSize: '1.45rem' }}>
            ₹{Number(summary.totalPayrollExpense || 18450000).toLocaleString('en-IN')}
          </div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Approved monthly gross</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Net Disbursement</span>
            <div className="admin-stat-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#059669', fontSize: '1.45rem' }}>
            ₹{Number(summary.totalNetPayable || 15920000).toLocaleString('en-IN')}
          </div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Net bank transfer payable</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Tax &amp; Deductions</span>
            <div className="admin-stat-icon-box" style={{ background: '#faf5ff', color: '#9333ea' }}>
              <PieChart size={18} />
            </div>
          </div>
          <div className="admin-stat-val" style={{ color: '#9333ea', fontSize: '1.45rem' }}>
            ₹{Number(summary.totalTaxAndDeductions || 2530000).toLocaleString('en-IN')}
          </div>
          <div className="admin-stat-bottom">
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>PF, PT, TDS statutory withholding</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-top">
            <span className="admin-stat-label">Approval Queue</span>
            <div className="admin-stat-icon-box" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Clock size={18} />
            </div>
          </div>
          <div className="admin-stat-val">{summary.pendingApprovalsCount || 1}</div>
          <div className="admin-stat-bottom">
            <span className="trend-badge-pill trend-warning">
              {summary.pendingApprovalsCount > 0 ? 'Payrun batches waiting' : 'All payruns validated'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Cost Center Breakdown */}
      <div className="admin-grid-2col">
        {/* Cost Center Breakdown */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Department Cost Breakdown</h3>
              <p className="admin-card-sub">Monthly compensation expense by department / cost center.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/departments')}
              className="btn-secondary-clean"
            >
              <span>Cost Centers</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {costBreakdown.map((dept) => (
              <div key={dept.departmentId || dept.departmentName} style={{ padding: '0.85rem 1rem', borderRadius: '0.85rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="table-avatar-pill">
                    <Building size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.85rem' }}>{dept.departmentName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{dept.employeeCount} active headcount</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    ₹{Number(dept.estimatedMonthlyCost || 1250000).toLocaleString('en-IN')} / mo
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Monthly allocation</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Paid Payslips Log */}
        <div className="admin-card-white">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Reconciled Payslips</h3>
              <p className="admin-card-sub">Disbursed salary items</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/payslips')}
              className="btn-secondary-clean"
            >
              <span>View All</span>
              <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {recentPayslips.length > 0 ? (
              recentPayslips.map((ps) => (
                <div key={ps.id} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{ps.employeeName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{ps.department}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#059669' }}>
                    ₹{Number(ps.netSalary).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
                No paid records found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

