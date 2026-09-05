import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { FileText, Printer, ArrowRight } from 'lucide-react';

export function PayslipsPage() {
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payroll/payslips');
      setPayslips(res.data?.payslips || res.data || []);
    } catch (err) {
      console.error('Failed to load payslips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Generated Payslips ({payslips.length})
          </h2>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Slip Ref</th>
                <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Gross Salary</th>
                <th style={{ padding: '0.85rem 1rem' }}>Deductions</th>
                <th style={{ padding: '0.85rem 1rem' }}>Net Salary</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Official Document</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading payslip records from PostgreSQL...
                  </td>
                </tr>
              ) : payslips.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No payslips computed yet. Run a Payrun to generate slips.
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
                      <Link
                        to={`/payslips/${ps.id}`}
                        style={{ color: 'var(--primary)', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        PS-{ps.id.slice(0, 8).toUpperCase()}
                      </Link>
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
                    <td style={{ padding: '1rem' }}>
                      <span className="badge green">COMPUTED</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <a
                        href={`http://localhost:3000/api/v1/payroll/payslips/${ps.id}/html`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-pill-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileText size={14} /> View HTML / Print
                      </a>
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
