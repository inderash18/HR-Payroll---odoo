import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { OrgAdminDashboard } from './components/OrgAdminDashboard';
import { HRManagerDashboard } from './components/HRManagerDashboard';
import { PayrollManagerDashboard } from './components/PayrollManagerDashboard';
import { FinanceManagerDashboard } from './components/FinanceManagerDashboard';
import { DepartmentManagerDashboard } from './components/DepartmentManagerDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { AuditorDashboard } from './components/AuditorDashboard';
import { Loader2 } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      console.error('Failed to load role dashboard:', err);
      setError('Unable to load dashboard data. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-gray-500">
        <Loader2 className="animate-spin text-black" size={32} />
        <span className="text-sm font-semibold">Loading your workspace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-6 text-center my-6">
        <div className="font-bold text-base mb-1">Dashboard Error</div>
        <p className="text-sm text-rose-600 mb-4">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  const role = user?.role || 'EMPLOYEE';

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard data={dashboardData} onRefresh={loadDashboard} />;

    case 'ORGANIZATION_ADMIN':
    case 'ADMIN':
      return <OrgAdminDashboard data={dashboardData} onRefresh={loadDashboard} />;

    case 'HR_MANAGER':
      return <HRManagerDashboard data={dashboardData} onRefresh={loadDashboard} />;

    case 'PAYROLL_MANAGER':
    case 'HR_PAYROLL_MANAGER':
    case 'HR_PAYROLL_USER':
      return <PayrollManagerDashboard data={dashboardData} onRefresh={loadDashboard} />;

    case 'FINANCE_MANAGER':
      return <FinanceManagerDashboard data={dashboardData} onRefresh={loadDashboard} />;

    case 'DEPARTMENT_MANAGER':
      return <DepartmentManagerDashboard data={dashboardData} onRefresh={loadDashboard} />;

    case 'AUDITOR':
      return <AuditorDashboard data={dashboardData} onRefresh={loadDashboard} />;

    case 'EMPLOYEE':
    default:
      return <EmployeeDashboard data={dashboardData} onRefresh={loadDashboard} />;
  }
}
