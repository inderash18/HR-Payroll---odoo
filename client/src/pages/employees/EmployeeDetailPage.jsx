import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { ArrowLeft, FileSignature, Loader2 } from 'lucide-react';

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [empRes, contractsRes] = await Promise.all([
          api.get(`/employees/${id}`).catch(() => null),
          api.get(`/contracts?employeeId=${id}`).catch(() => ({ data: [] })),
        ]);

        let emp = empRes?.data?.employee || empRes?.data || null;
        if (!emp) {
          const allRes = await api.get('/employees').catch(() => ({ data: [] }));
          const all = allRes.data?.employees || allRes.data || [];
          emp = all.find((e) => e.id === id || e.employeeNum === id) || null;
        }

        setEmployee(emp);
        setContracts(contractsRes.data?.contracts || contractsRes.data || []);
      } catch (err) {
        console.error('Failed to load employee detail:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px', color: 'var(--text-muted)' }}>
        <p>Loading employee record from PostgreSQL...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="card" style={{ padding: '2rem' }}>
        <div className="detail-header-actions">
          <button className="btn-back" onClick={() => navigate('/employees')}>
            <ArrowLeft size={16} /> Back to Employees
          </button>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>Employee Not Found</h3>
          <p style={{ marginTop: '0.5rem' }}>
            Could not locate employee record with ID: <code>{id}</code>
          </p>
        </div>
      </div>
    );
  }

  const primaryContract = contracts.find((c) => c.status === 'ACTIVE') || contracts[0];
  const roleLabel = (employee.user?.role || employee.jobPosition?.title || employee.jobTitle || 'EMPLOYEE').replace(/_/g, ' ');

  return (
    <div>
      {/* Breadcrumb Navigation */}
      <div className="breadcrumb-container">
        <Link to="/dashboard" className="breadcrumb-link">
          Dashboard
        </Link>
        <span className="breadcrumb-separator">/</span>
        <Link to="/employees" className="breadcrumb-link">
          Employees
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          {employee.firstName} {employee.lastName}
        </span>
      </div>

      <div className="detail-header-actions">
        <button className="btn-back" id="btn-back-employees" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back to Employees
        </button>
        <button className="btn-back" id="btn-goto-contracts" onClick={() => navigate('/contracts')}>
          <FileSignature size={16} /> View Contracts
        </button>
      </div>

      {/* Main Employee Detail Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'var(--primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}
          >
            {employee.firstName?.charAt(0)}
            {employee.lastName?.charAt(0)}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {employee.firstName} {employee.lastName}
              </h2>
              <span className={`badge ${employee.isActive ? 'green' : 'red'}`}>
                {employee.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Employee Number: <strong>{employee.employeeNum}</strong> &bull; Work Email:{' '}
              <strong>{employee.workEmail}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Department</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {employee.department?.name || 'Not assigned'}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Designation / Role</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {employee.jobPosition?.title || employee.jobTitle || roleLabel}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bank Account (Masked)</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
              {employee.bankAccountMasked || '••••••••'}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Working Schedule</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {employee.workingSchedule?.name || 'Standard 40h/week (IST)'}
            </span>
          </div>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Contract Status</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem' }}>
              {primaryContract ? (
                <span className="badge green">
                  ACTIVE (₹{Number(primaryContract.wage || 0).toLocaleString('en-IN')}/mo)
                </span>
              ) : (
                <span className="badge orange">NO ACTIVE CONTRACT</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
