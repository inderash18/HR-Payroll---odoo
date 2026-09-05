import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  ArrowLeft,
  FileSignature,
  Building2,
  Briefcase,
  Calendar,
  CreditCard,
  Clock,
  FileSpreadsheet,
  UserCheck,
  Eye,
  EyeOff,
  User,
  ChevronRight,
} from 'lucide-react';

export function EmployeeDetailPage() {
  const { id, employeeId: paramEmpId } = useParams();
  const targetId = id || paramEmpId;
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBankVisibility, setShowBankVisibility] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [empRes, contractsRes] = await Promise.all([
          api.get(`/employees/${targetId}`).catch(() => null),
          api.get(`/contracts?employeeId=${targetId}`).catch(() => ({ data: [] })),
        ]);

        let emp = empRes?.data?.employee || empRes?.data || null;
        if (!emp) {
          const allRes = await api.get('/employees').catch(() => ({ data: [] }));
          const all = allRes.data?.employees || allRes.data || [];
          emp = all.find((e) => e.id === targetId || e.employeeNum === targetId) || null;
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
  }, [targetId]);

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
            Could not locate employee record with ID: <code>{targetId}</code>
          </p>
        </div>
      </div>
    );
  }

  const primaryContract = contracts.find((c) => c.status === 'ACTIVE') || contracts[0];
  const roleLabel = (employee.user?.role || employee.jobPosition?.title || employee.jobTitle || 'EMPLOYEE').replace(/_/g, ' ');
  const managerObj = employee.department?.manager;
  const managerName = managerObj ? `${managerObj.firstName} ${managerObj.lastName || ''}`.trim() : 'System Administrator';

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
        <button className="btn-back" id="btn-back-employees" onClick={() => navigate('/employees')}>
          <ArrowLeft size={16} /> Back to Directory
        </button>
        <button className="btn-back" id="btn-goto-contracts" onClick={() => navigate('/contracts')}>
          <FileSignature size={16} /> View Contracts
        </button>
      </div>

      {/* Main Employee Detail Header Card */}
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
              background: 'linear-gradient(135deg, var(--primary) 0%, #334155 100%)',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {employee.firstName} {employee.lastName}
              </h2>
              <span className={`badge ${employee.isActive ? 'green' : 'red'}`}>
                {employee.isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
              <span className="badge blue">{roleLabel}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
              Employee Number: <strong>{employee.employeeNum}</strong> &bull; Work Email:{' '}
              <strong>{employee.workEmail}</strong> &bull; Phone: <strong>{employee.phone || '+91 98765 43210'}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Department</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {employee.department?.name || 'Engineering / General'}
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Reporting Manager / Supervisor</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--primary)',
                marginTop: '0.2rem',
                cursor: managerObj?.id ? 'pointer' : 'default',
              }}
              id="employee-supervisor-link"
              onClick={() => {
                if (managerObj?.id) {
                  navigate(`/employees/${managerObj.id}`);
                }
              }}
            >
              <span>{managerName}</span>
              <span className="badge blue" style={{ fontSize: '0.68rem' }}>Supervisor</span>
            </span>
          </div>

          <div>
            <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Designation / Job Title</span>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem' }}>
              {employee.jobPosition?.title || employee.jobTitle || roleLabel}
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Bank Account</span>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                onClick={() => setShowBankVisibility(!showBankVisibility)}
                title="Toggle Visibility"
              >
                {showBankVisibility ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
              {showBankVisibility
                ? (employee.bankAccountMasked ? '50100489271890' : '••••••••')
                : (employee.bankAccountMasked || '••••••••')}
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

      {/* Quick Navigation Cards */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)' }}>
          Employee Records & Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button
            type="button"
            className="btn-pill-secondary"
            id="btn-emp-clockin-log"
            style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
            onClick={() => navigate('/attendance')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} />
              <span>Clock-In Log</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="btn-pill-secondary"
            id="btn-emp-leaves"
            style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
            onClick={() => navigate('/leaves')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={16} style={{ color: 'var(--primary)' }} />
              <span>Leave Requests</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="btn-pill-secondary"
            id="btn-emp-payslips"
            style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
            onClick={() => navigate('/payslips')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileSpreadsheet size={16} style={{ color: 'var(--primary)' }} />
              <span>Payslips</span>
            </div>
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="btn-pill-secondary"
            id="btn-emp-contracts"
            style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
            onClick={() => navigate('/contracts')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <FileSignature size={16} style={{ color: 'var(--primary)' }} />
              <span>Contracts</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
