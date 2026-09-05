import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowUpRight, CheckCircle2, DollarSign } from 'lucide-react';

export function PayrollOverview({ payrollData, summary = {} }) {
  const navigate = useNavigate();

  const data = payrollData || {};
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const cycle = data.cycle || currentMonth;
  const employeesIncluded = data.employeesIncluded ?? summary.activeContracts ?? summary.activeEmployees ?? 0;
  const totalEmployees = data.totalEmployees ?? summary.totalEmployees ?? employeesIncluded;
  const grossPayroll = data.grossPayroll ?? summary.latestPayrunGross ?? 0;
  const estimatedNetPayout = data.estimatedNetPayout ?? summary.latestPayrunNet ?? 0;
  const totalDeductions = data.totalDeductions ?? Math.max(0, grossPayroll - estimatedNetPayout);
  const status = data.status || summary.currentPayrollStatus || 'READY_TO_RUN';
  const processingCompletion = data.processingCompletion ?? (totalEmployees > 0 ? Math.round((employeesIncluded / totalEmployees) * 100) : 100);

  const formatINR = (val) => `₹${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <div className="admin-card-white" id="admin-payroll-overview-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">{cycle} Payroll Overview</h2>
          <p className="admin-card-sub">Cycle progress, financial disbursement summary, and validation status</p>
        </div>

        <span
          style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
          }}
        >
          {status}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>
          <span style={{ color: '#0f172a' }}>
            Processing Readiness ({employeesIncluded} / {totalEmployees} Personnel)
          </span>
          <span style={{ color: '#0f172a' }}>{processingCompletion}%</span>
        </div>
        <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${processingCompletion}%`,
              height: '100%',
              background: '#0f172a',
              borderRadius: '9999px',
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      </div>

      {/* Financial 3-box Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.25rem' }}>
        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.85rem', border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Gross Payroll</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '0.2rem' }}>
            {formatINR(grossPayroll)}
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.85rem', border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Deductions</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#64748b', marginTop: '0.2rem' }}>
            {formatINR(totalDeductions)}
          </div>
        </div>

        <div style={{ background: '#ecfdf5', padding: '0.85rem 1rem', borderRadius: '0.85rem', border: '1px solid #d1fae5' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Estimated Net Payout</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#047857', marginTop: '0.2rem' }}>
            {formatINR(estimatedNetPayout)}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-primary-black"
          onClick={() => navigate('/payroll')}
        >
          <Landmark size={15} />
          <span>Review Payroll</span>
        </button>

        <button
          type="button"
          className="btn-secondary-clean"
          onClick={() => navigate('/payslips')}
        >
          <span>View Payroll Details</span>
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
}
