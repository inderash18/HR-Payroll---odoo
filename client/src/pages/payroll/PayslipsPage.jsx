import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Receipt, FileText } from 'lucide-react';

export function PayslipsPage() {
  const [payslips, setPayslips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadPayslips() {
      try {
        const res = await api.get('/payroll/payslips');
        setPayslips(res.data || []);
      } catch (err) {
        console.error('Failed to load payslips:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPayslips();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Individual Salary Payslips
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Itemized salary receipts, deduction breakdowns, and printable PDF statements.
        </p>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Pay Period</th>
              <th>Gross Salary</th>
              <th>Deductions</th>
              <th>Net Take-Home</th>
              <th>Batch</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Loading payslips...</td></tr>
            ) : payslips.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No payslips found.</td></tr>
            ) : (
              payslips.map((p) => (
                <tr key={p.id}>
                  <td>
                    <strong>{p.employee?.firstName} {p.employee?.lastName}</strong>
                  </td>
                  <td>{p.employee?.employeeNum}</td>
                  <td>
                    {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
                  </td>
                  <td>₹{Number(p.grossSalary).toLocaleString()}</td>
                  <td>₹{Number(p.deductionAmount).toLocaleString()}</td>
                  <td><strong style={{ color: '#10b981' }}>₹{Number(p.netSalary).toLocaleString()}</strong></td>
                  <td><span className="badge badge-neutral">{p.payrun?.name || 'Batch'}</span></td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => navigate(`/payslips/${p.id}`)}
                    >
                      View Breakdown
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
