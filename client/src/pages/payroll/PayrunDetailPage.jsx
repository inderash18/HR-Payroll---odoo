import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, Receipt, Play, Check, CheckCircle2 } from 'lucide-react';

export function PayrunDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payrun, setPayrun] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prRes, psRes] = await Promise.all([
        api.get(`/payroll/payruns/${id}`).catch(() => null),
        api.get(`/payroll/payslips?payrunId=${id}`).catch(() => ({ data: [] })),
      ]);

      let pr = prRes?.data?.payrun || prRes?.data || null;
      if (!pr) {
        const allRes = await api.get('/payroll/payruns').catch(() => ({ data: [] }));
        const all = allRes.data?.payruns || allRes.data || [];
        pr = all.find((p) => p.id === id) || null;
      }

      setPayrun(pr);
      setPayslips(psRes.data?.payslips || psRes.data || []);
    } catch (err) {
      console.error('Failed to load payrun details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
        <p>Loading payrun details from PostgreSQL...</p>
      </div>
    );
  }

  if (!payrun) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <div className="detail-header-actions">
          <button className="btn-back" onClick={() => navigate('/payroll')}>
            <ArrowLeft size={16} /> Back to Payroll
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Payrun Not Found</h3>
          <p style={{ marginTop: '0.5rem' }}>Could not locate payrun record with ID: <code>{id}</code></p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="breadcrumb-container">
        <Link to="/dashboard" className="breadcrumb-link">
          Dashboard
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/payroll" className="breadcrumb-link">
          Payroll
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{payrun.name}</span>
      </div>

      <div className="detail-header-actions">
        <button className="btn-back" id="btn-back-payroll" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Payroll
        </button>
      </div>

      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>{payrun.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Period: {new Date(payrun.startDate).toLocaleDateString()} &ndash;{' '}
              {new Date(payrun.endDate).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`badge ${
              payrun.status === 'PAID'
                ? 'green'
                : payrun.status === 'VALIDATED'
                ? 'blue'
                : payrun.status === 'COMPUTED'
                ? 'orange'
                : 'neutral'
            }`}
          >
            {payrun.status}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.25rem',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Gross Disbursed</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              ₹{Number(payrun.totalGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Net Payable</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-text)', marginTop: '0.25rem' }}>
              ₹{Number(payrun.totalNet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Slips Generated</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '0.25rem' }}>
              {payslips.length}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Generated Slips in Batch ({payslips.length})
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Slip Ref</th>
                <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Gross</th>
                <th style={{ padding: '0.85rem 1rem' }}>Deductions</th>
                <th style={{ padding: '0.85rem 1rem' }}>Net</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No payslips in this batch yet.
                  </td>
                </tr>
              ) : (
                payslips.map((ps) => (
                  <tr
                    key={ps.id}
                    className="clickable-row"
                    onClick={() => navigate(`/payslips/${ps.id}`)}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      PS-{ps.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {ps.employee ? `${ps.employee.firstName} ${ps.employee.lastName}` : 'Employee'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      ₹{Number(ps.grossSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--red-text)' }}>
                      ₹{Number(ps.deductionAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--green-text)' }}>
                      ₹{Number(ps.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <button
                        className="btn-pill-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/payslips/${ps.id}`);
                        }}
                      >
                        View Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
