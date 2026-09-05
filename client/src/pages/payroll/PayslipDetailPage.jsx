import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, Printer, Download, Building2, User } from 'lucide-react';

export function PayslipDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPayslip() {
      try {
        const res = await api.get(`/payroll/payslips/${id}`);
        setPayslip(res.data);
      } catch (err) {
        console.error('Failed to load payslip:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPayslip();
  }, [id]);

  const handlePrint = async () => {
    try {
      const res = await api.get(`/payroll/payslips/${id}/html`);
      const win = window.open('', '_blank');
      win.document.write(res.data.html);
      win.document.close();
      win.print();
    } catch (err) {
      alert('Failed to generate printable document');
    }
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading payslip statement...</div>;
  }

  if (!payslip) {
    return <div style={{ padding: '20px' }}>Payslip record not found.</div>;
  }

  const earnings = payslip.lines?.filter((l) => ['BASIC', 'ALLOWANCE', 'EARNING', 'GROSS'].includes(l.category)) || [];
  const deductions = payslip.lines?.filter((l) => ['DEDUCTION', 'TAX'].includes(l.category)) || [];

  return (
    <div>
      <div className="breadcrumbs">
        <Link to="/dashboard">Dashboard</Link> / <Link to="/payslips">Payslips</Link> / <span>{payslip.employee?.firstName} {payslip.employee?.lastName}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print Official Payslip
        </button>
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>PEOPLEPAY360 SALARY STATEMENT</h1>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Period: {new Date(payslip.periodStart).toLocaleDateString()} — {new Date(payslip.periodEnd).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-success">Official Salary Record</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <div>
            <div><strong>Employee:</strong> {payslip.employee?.firstName} {payslip.employee?.lastName}</div>
            <div><strong>Employee ID:</strong> {payslip.employee?.employeeNum}</div>
            <div><strong>Email:</strong> {payslip.employee?.workEmail || 'N/A'}</div>
          </div>
          <div>
            <div><strong>Department:</strong> {payslip.employee?.department?.name || 'General'}</div>
            <div><strong>Job Position:</strong> {payslip.employee?.jobPosition?.title || 'Staff'}</div>
            <div><strong>Bank Account:</strong> {payslip.employee?.bankAccountMasked || '•••• •••• 4821'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>Earnings & Allowances</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((e) => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td>₹{Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: '#0f172a' }}>Statutory & Other Deductions</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((d) => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>₹{Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: '#f1f5f9', padding: '20px', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Gross Earnings: <strong>₹{Number(payslip.grossSalary).toLocaleString()}</strong></div>
            <div style={{ fontSize: '13px', color: '#64748b' }}>Total Deductions: <strong>₹{Number(payslip.deductionAmount).toLocaleString()}</strong></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Net Take-Home Pay</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
              ₹{Number(payslip.netSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
