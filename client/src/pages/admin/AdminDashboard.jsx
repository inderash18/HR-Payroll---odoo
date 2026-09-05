import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin-dashboard.css';

// Mock Data Source (API Ready)
import {
  adminDashboardSummary,
  workforceTrendData,
  attendanceData,
  departmentData,
  pendingApprovals,
  recentEmployees,
  payrollOverview,
  adminRecentActivities,
  companyAlerts,
} from '../../mocks/adminDashboardMock';

// Modular Dashboard Components
import { WelcomeHeader } from '../../components/admin-dashboard/WelcomeHeader';
import { AdminStatsGrid } from '../../components/admin-dashboard/AdminStatsGrid';
import { WorkforceChart } from '../../components/admin-dashboard/WorkforceChart';
import { AttendanceOverview } from '../../components/admin-dashboard/AttendanceOverview';
import { DepartmentDistribution } from '../../components/admin-dashboard/DepartmentDistribution';
import { PendingApprovals } from '../../components/admin-dashboard/PendingApprovals';
import { RecentEmployeesTable } from '../../components/admin-dashboard/RecentEmployeesTable';
import { PayrollOverview } from '../../components/admin-dashboard/PayrollOverview';
import { RecentActivity } from '../../components/admin-dashboard/RecentActivity';
import { AttentionNeeded } from '../../components/admin-dashboard/AttentionNeeded';

// Modals
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';

export function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const adminName = user?.firstName || 'Indhu';

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadReport = () => {
    triggerToast('Generating PeoplePay360 Comprehensive Executive Report (PDF)...');
  };

  const handleKpiCardClick = (type) => {
    switch (type) {
      case 'employees':
        navigate('/employees');
        break;
      case 'attendance':
        navigate('/attendance');
        break;
      case 'leaves':
        navigate('/leaves');
        break;
      case 'payroll':
        navigate('/payroll');
        break;
      default:
        break;
    }
  };

  const handlePendingApprovalView = (item) => {
    if (item.type === 'leave') navigate('/leaves');
    else if (item.type === 'payroll') navigate('/payroll');
    else if (item.type === 'profile') navigate('/employees');
    else if (item.type === 'reimbursement') navigate('/payroll');
    else triggerToast(`Opening review drawer for ${item.title}`);
  };

  return (
    <div className="admin-dash-container" id="organization-admin-dashboard-root">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '0.75rem 1.25rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            fontWeight: 700,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. WELCOME SECTION */}
      <WelcomeHeader
        userName={adminName}
        onAddEmployee={() => setShowAddModal(true)}
        onDownloadReport={handleDownloadReport}
      />

      {/* 2. KPI STATS CARDS */}
      <AdminStatsGrid
        summary={adminDashboardSummary}
        onCardClick={handleKpiCardClick}
      />

      {/* 3. DUAL COLUMN: WORKFORCE OVERVIEW CHART & TODAY'S ATTENDANCE */}
      <div className="admin-grid-2col">
        <WorkforceChart trendData={workforceTrendData} />
        <AttendanceOverview attendanceData={attendanceData} />
      </div>

      {/* 4. DUAL COLUMN: DEPARTMENT DISTRIBUTION & PENDING APPROVALS */}
      <div className="admin-grid-2col">
        <DepartmentDistribution departments={departmentData} />
        <PendingApprovals
          approvals={pendingApprovals}
          onViewItem={handlePendingApprovalView}
        />
      </div>

      {/* 5. RECENTLY ADDED EMPLOYEES TABLE */}
      <RecentEmployeesTable employees={recentEmployees} />

      {/* 6. DUAL COLUMN: SEPTEMBER PAYROLL OVERVIEW & RECENT ACTIVITY / ALERTS */}
      <div className="admin-grid-2col">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <PayrollOverview payrollData={payrollOverview} />
          <AttentionNeeded alerts={companyAlerts} />
        </div>

        <RecentActivity activities={adminRecentActivities} />
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            triggerToast('New employee onboarded successfully!');
          }}
        />
      )}
    </div>
  );
}
