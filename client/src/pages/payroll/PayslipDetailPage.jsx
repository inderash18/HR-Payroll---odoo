import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, Printer } from 'lucide-react';

export function PayslipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const res = await api.get(`/payroll/payslips/${id}`).catch(() => null);
        let ps = res?.data?.payslip || res?.data || null;

        if (!ps) {
          const allRes = await api.get('/payroll/payslips').catch(() => ({ data: [] }));
          const all = allRes.data?.payslips || allRes.data || [];
          ps = all.find((p) => p.id === id || p.id.startsWith(id)) || null;
        }

        setPayslip(ps);
      } catch (err) {
        console.error('Failed to load payslip:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
        <p>Loading payslip from PostgreSQL...</p>
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <div className="detail-header-actions">
          <button className="btn-back" onClick={() => navigate('/payslips')}>
            <ArrowLeft size={16} /> Back to Payslips
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Payslip Not Found</h3>
          <p style={{ marginTop: '0.5rem' }}>Could not locate payslip record with ID: <code>{id}</code></p>
        </div>
      </div>
    );
  }

  const empName = payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : 'Employee';

  return (
    <div>
      <div className="breadcrumb-container">
        <Link to="/dashboard" className="breadcrumb-link">
          Dashboard
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/payslips" className="breadcrumb-link">
          Payslips
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          PS-{payslip.id.slice(0, 8).toUpperCase()} ({empName})
        </span>
      </div>

      <div className="detail-header-actions">
        <button className="btn-back" id="btn-back-payslips" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Payslips
        </button>
        <a
          href={`http://localhost:3000/api/v1/payroll/payslips/${payslip.id}/html`}
          target="_blank"
          rel="noreferrer"
          className="btn-back"
          style={{ textDecoration: 'none', color: 'var(--primary)' }}
        >
          <Printer size={16} /> Printable PDF / HTML
        </a>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <span className="badge blue" style={{ marginBottom: '0.5rem' }}>
              PAYSLIP STATEMENT
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
              PS-{payslip.id.slice(0, 8).toUpperCase()}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Employee: <strong>{empName}</strong> &bull; Period:{' '}
              {new Date(payslip.periodStart).toLocaleDateString()} -{' '}
              {new Date(payslip.periodEnd).toLocaleDateString()}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Net Salary</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--green-text)' }}>
              ₹{Number(payslip.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Earnings Summary</h4>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Gross Salary</span>
              <span style={{ fontWeight: 700 }}>
                ₹{Number(payslip.grossSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {payslip.lineItems
              ?.filter((item) => item.category === 'EARNING' || item.category === 'BASIC' || item.category === 'ALW')
              ?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                  <span style={{ fontWeight: 600 }}>₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
          </div>

          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Deductions Summary</h4>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.9rem',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Total Statutory Deductions</span>
              <span style={{ fontWeight: 700, color: 'var(--red-text)' }}>
                ₹{Number(payslip.deductionAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {payslip.lineItems
              ?.filter((item) => item.category === 'DEDUCTION' || item.category === 'DED')
              ?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0',
                    borderBottom: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
                  <span style={{ fontWeight: 600, color: 'var(--red-text)' }}>
                    ₹{Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
