import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, Play, CheckCircle2, DollarSign, Send, AlertTriangle } from 'lucide-react';

export function PayrunDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payrun, setPayrun] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadPayrun = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/payroll/payruns/${id}`);
      setPayrun(res.data);
    } catch (err) {
      console.error('Failed to load payrun details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayrun();
  }, [id]);

  const handleCompute = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post(`/payroll/payruns/${id}/compute`);
      setMessage({ type: 'success', text: 'AST Payroll rules evaluated & payslips generated!' });
      loadPayrun();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Computation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post(`/payroll/payruns/${id}/validate`);
      setMessage({ type: 'success', text: 'Payrun calculations validated and locked!' });
      loadPayrun();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Validation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post(`/payroll/payruns/${id}/pay`);
      setMessage({ type: 'success', text: 'Payrun marked as Paid! Transactions committed.' });
      loadPayrun();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Payment mark failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPayslips = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post(`/payroll/payruns/${id}/send-payslips`);
      setMessage({ type: 'success', text: 'Payslips enqueued for delivery to employee emails.' });
      loadPayrun();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Email dispatch failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading payrun batch details...</div>;
  }

  if (!payrun) {
    return <div style={{ padding: '20px' }}>Payrun batch not found.</div>;
  }

  return (
    <div>
      <div className="breadcrumbs">
        <Link to="/dashboard">Dashboard</Link> / <Link to="/payroll">Payroll</Link> / <span>{payrun.name}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/payroll')}>
          <ArrowLeft size={16} /> Back to Payruns
        </button>

        <div style={{ display: 'flex', gap: '12px' }}>
          {['DRAFT', 'COMPUTED', 'WARNINGS_FOUND'].includes(payrun.status) && (
            <button className="btn btn-primary" onClick={handleCompute} disabled={actionLoading}>
              <Play size={16} /> Compute Salary Rules
            </button>
          )}

          {['COMPUTED', 'WARNINGS_FOUND'].includes(payrun.status) && (
            <button className="btn btn-success" onClick={handleValidate} disabled={actionLoading}>
              <CheckCircle2 size={16} /> Validate Batch
            </button>
          )}

          {payrun.status === 'VALIDATED' && (
            <button className="btn btn-primary" onClick={handleMarkPaid} disabled={actionLoading}>
              <DollarSign size={16} /> Mark as Paid
            </button>
          )}

          {['VALIDATED', 'PAID'].includes(payrun.status) && (
            <button className="btn btn-secondary" onClick={handleSendPayslips} disabled={actionLoading}>
              <Send size={16} /> Email Payslips
            </button>
          )}
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: message.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            border: `1px solid ${message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
            fontSize: '13.5px',
          }}
        >
          {message.text}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>{payrun.name}</h1>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Period: {new Date(payrun.startDate).toLocaleDateString()} — {new Date(payrun.endDate).toLocaleDateString()}
            </div>
          </div>
          <span className={`badge badge-${payrun.status === 'PAID' ? 'success' : payrun.status === 'VALIDATED' ? 'info' : 'warning'}`}>
            {payrun.status}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Gross Salary</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>₹{Number(payrun.totalGross).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Net Take-Home</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#10b981' }}>₹{Number(payrun.totalNet).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Generated Slips</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{payrun.payslips?.length || 0}</div>
          </div>
        </div>
      </div>

      {payrun.warnings?.length > 0 && (
        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="card-header" style={{ marginBottom: '12px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309' }}>
              <AlertTriangle size={18} /> Calculation Warnings ({payrun.warnings.length})
            </div>
          </div>
          <ul style={{ paddingLeft: '20px', fontSize: '13.5px', color: '#92400e' }}>
            {payrun.warnings.map((w) => (
              <li key={w.id} style={{ marginBottom: '6px' }}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <div className="card-title">Generated Payslips</div>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Gross Salary</th>
              <th>Deductions</th>
              <th>Net Pay</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payrun.payslips?.length > 0 ? (
              payrun.payslips.map((slip) => (
                <tr key={slip.id}>
                  <td><strong>{slip.employee?.firstName} {slip.employee?.lastName}</strong></td>
                  <td>{slip.employee?.employeeNum}</td>
                  <td>{slip.employee?.department?.name || 'General'}</td>
                  <td>₹{Number(slip.grossSalary).toLocaleString()}</td>
                  <td>₹{Number(slip.deductionAmount).toLocaleString()}</td>
                  <td><strong style={{ color: '#10b981' }}>₹{Number(slip.netSalary).toLocaleString()}</strong></td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => navigate(`/payslips/${slip.id}`)}
                    >
                      View Slip
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No payslips computed yet. Click "Compute Salary Rules" above to generate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
