import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, User, Mail, Phone, Building2, Calendar, FileText, Landmark } from 'lucide-react';

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEmployee() {
      try {
        const res = await api.get(`/employees/${id}`);
        setEmployee(res.data);
      } catch (err) {
        console.error('Failed to load employee details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEmployee();
  }, [id]);

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading employee details...</div>;
  }

  if (!employee) {
    return <div style={{ padding: '20px' }}>Employee profile not found.</div>;
  }

  return (
    <div>
      <div className="breadcrumbs">
        <Link to="/dashboard">Dashboard</Link> / <Link to="/employees">Employees</Link> / <span>{employee.firstName} {employee.lastName}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/employees')}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
          <div className="user-avatar" style={{ width: '64px', height: '64px', fontSize: '24px', background: '#0f172a' }}>
            {employee.firstName[0]}
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              {employee.firstName} {employee.lastName}
            </h1>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', display: 'flex', gap: '16px', marginTop: '4px' }}>
              <span><strong>ID:</strong> {employee.employeeNum}</span>
              <span><strong>Dept:</strong> {employee.department?.name || 'General'}</span>
              <span><strong>Role:</strong> {employee.jobPosition?.title || 'Staff'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: 'var(--radius-md)' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Work Email</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{employee.workEmail}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Phone Number</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{employee.phone || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Bank Details</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{employee.bankName || 'N/A'} ({employee.bankAccountMasked || '••••'})</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Tax Identification</div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>{employee.taxId || '—'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Compensation Contracts</div>
        </div>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Contract Title</th>
              <th>Structure</th>
              <th>Wage</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {employee.contracts?.length > 0 ? (
              employee.contracts.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.structure?.name || 'Standard'}</td>
                  <td>₹{Number(c.wage).toLocaleString()}/{c.wagePeriod?.toLowerCase()}</td>
                  <td>{new Date(c.startDate).toLocaleDateString()}</td>
                  <td>{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Present (Open-ended)'}</td>
                  <td>
                    <span className={`badge badge-${c.status === 'ACTIVE' ? 'success' : 'neutral'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  No active contracts associated.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
