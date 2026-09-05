import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleDashboardPath } from '../../config/navigation.config';
import { AdminDashboard } from '../admin/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { HRManagerDashboard } from './components/HRManagerDashboard';
import { PayrollManagerDashboard } from './components/PayrollManagerDashboard';
import { FinanceManagerDashboard } from './components/FinanceManagerDashboard';
import { DepartmentManagerDashboard } from './components/DepartmentManagerDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AuditorDashboard } from './components/AuditorDashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role && location.pathname === '/dashboard') {
      const target = getRoleDashboardPath(user.role);
      if (target && target !== '/dashboard') {
        navigate(target, { replace: true });
      }
    }
  }, [user?.role, location.pathname, navigate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load role dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.role]);


  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '350px', color: 'var(--text-muted)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 12px' }}></div>
          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Loading live dashboard data...</p>
        </div>
      </div>
    );
  }

  const role = user?.role || 'EMPLOYEE';

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard data={data} onRefresh={loadData} />;
    case 'ORGANIZATION_ADMIN':
    case 'ADMIN':
      return <AdminDashboard user={user} data={data} onRefresh={loadData} />;
    case 'HR_MANAGER':
      return <HRManagerDashboard data={data} onRefresh={loadData} />;
    case 'PAYROLL_MANAGER':
    case 'HR_PAYROLL_MANAGER':
    case 'HR_PAYROLL_USER':
      return <PayrollManagerDashboard data={data} onRefresh={loadData} />;
    case 'FINANCE_MANAGER':
      return <FinanceManagerDashboard data={data} onRefresh={loadData} />;
    case 'DEPARTMENT_MANAGER':
      return <DepartmentManagerDashboard data={data} onRefresh={loadData} />;
    case 'AUDITOR':
      return <AuditorDashboard data={data} onRefresh={loadData} />;
    case 'EMPLOYEE':
    default:
      return <EmployeeDashboard data={data} onRefresh={loadData} />;
  }
}
