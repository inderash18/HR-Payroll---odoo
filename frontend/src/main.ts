import './style.css';
import { Role } from './api/types';
import { router, RouteMatch } from './router';
import { authStore } from './state/auth';
import { renderLoading } from './utils/ui';
import { renderDashboardShell } from './components/layout/Shell';

// Views
import { renderLogin } from './views/auth/LoginView';
import { loadDashboardView } from './views/dashboard/DashboardView';
import { loadEmployeesView } from './views/employees/EmployeesView';
import { loadEmployeeDetailView } from './views/employees/EmployeeDetailView';
import { openAddEmployeeModal } from './views/employees/AddEmployeeModal';
import { loadDepartmentsView } from './views/departments/DepartmentsView';
import { loadContractsView } from './views/contracts/ContractsView';
import { loadSchedulesView } from './views/schedules/SchedulesView';
import { loadAttendanceView } from './views/attendance/AttendanceView';
import { loadLeavesView } from './views/leaves/LeavesView';
import { loadPayrollView } from './views/payroll/PayrollView';
import { loadPayrunDetailView } from './views/payroll/PayrunDetailView';
import { loadPayslipsView } from './views/payroll/PayslipsView';
import { loadPayslipDetailView } from './views/payroll/PayslipDetailView';
import { loadUsersView } from './views/users/UsersView';
import { loadAuditLogsView } from './views/audit/AuditLogsView';
import { loadSecurityView } from './views/security/SecurityView';
import { loadSessionsView } from './views/security/SessionsView';
import { loadProfileView } from './views/profile/ProfileView';
import { loadSettingsView } from './views/settings/SettingsView';
import { loadAccessDeniedView } from './views/errors/AccessDeniedView';
import { loadNotFoundView } from './views/errors/NotFoundView';

// Role Access Guard Matrix
const ROLE_PERMISSIONS: Record<string, Role[]> = {
  dashboard: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  employees: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  'employee-detail': ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  leaves: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  attendance: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  schedules: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'],
  departments: ['ADMIN', 'HR_MANAGER'],
  contracts: ['ADMIN', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'],
  payroll: ['ADMIN', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'],
  'payrun-detail': ['ADMIN', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER'],
  payslips: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  'payslip-detail': ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  users: ['ADMIN'],
  audit: ['ADMIN'],
  settings: ['ADMIN'],
  security: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  sessions: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  profile: ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  '403': ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
  '404': ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER', 'EMPLOYEE'],
};

// Route Dispatcher
function renderRoute(match: RouteMatch): void {
  const contentArea = document.getElementById('tab-content');
  const headerTitle = document.getElementById('header-tab-title');
  if (!contentArea) return;

  const user = authStore.getState().user;
  if (!user) return;
  const role = (user?.role || 'ADMIN') as Role;

  // Sync sidebar active indicator
  const activeTabKey = match.tab.startsWith('employee')
    ? 'employees'
    : match.tab.startsWith('payrun')
      ? 'payroll'
      : match.tab.startsWith('payslip')
        ? 'payslips'
        : match.tab;

  document.querySelectorAll('.sidebar-nav-item').forEach((b) => b.classList.remove('active'));
  const activeNav = document.querySelector(`.sidebar-nav-item[data-tab="${activeTabKey}"]`);
  if (activeNav) activeNav.classList.add('active');

  // Role Permissions Check
  if (ROLE_PERMISSIONS[match.tab] && !ROLE_PERMISSIONS[match.tab].includes(role)) {
    if (headerTitle) headerTitle.innerText = 'Access Denied';
    loadAccessDeniedView(contentArea);
    return;
  }

  // Render Matching View
  switch (match.tab) {
    case 'dashboard':
      if (headerTitle) headerTitle.innerText = 'Dashboard';
      loadDashboardView(contentArea);
      break;
    case 'employees':
      if (headerTitle) headerTitle.innerText = 'Employees Directory';
      loadEmployeesView(contentArea);
      break;
    case 'employee-detail':
      if (headerTitle) headerTitle.innerText = 'Employee Details';
      loadEmployeeDetailView(contentArea, match.params.id);
      break;
    case 'departments':
      if (headerTitle) headerTitle.innerText = 'Departments';
      loadDepartmentsView(contentArea);
      break;
    case 'contracts':
      if (headerTitle) headerTitle.innerText = 'Compensation Contracts';
      loadContractsView(contentArea);
      break;
    case 'schedules':
      if (headerTitle) headerTitle.innerText = 'Working Schedules';
      loadSchedulesView(contentArea);
      break;
    case 'attendance':
      if (headerTitle) headerTitle.innerText = 'Attendance Tracking';
      loadAttendanceView(contentArea);
      break;
    case 'leaves':
      if (headerTitle) headerTitle.innerText = 'Time Off & Leaves';
      loadLeavesView(contentArea);
      break;
    case 'payroll':
      if (headerTitle) headerTitle.innerText = 'Payroll & Payrun Batches';
      loadPayrollView(contentArea);
      break;
    case 'payrun-detail':
      if (headerTitle) headerTitle.innerText = 'Payrun Batch Details';
      loadPayrunDetailView(contentArea, match.params.id);
      break;
    case 'payslips':
      if (headerTitle) headerTitle.innerText = 'Generated Payslips';
      loadPayslipsView(contentArea);
      break;
    case 'payslip-detail':
      if (headerTitle) headerTitle.innerText = 'Payslip Details';
      loadPayslipDetailView(contentArea, match.params.id);
      break;
    case 'users':
      if (headerTitle) headerTitle.innerText = 'User Management';
      loadUsersView(contentArea);
      break;
    case 'audit':
      if (headerTitle) headerTitle.innerText = 'Security Audit Logs';
      loadAuditLogsView(contentArea);
      break;
    case 'security':
      if (headerTitle) headerTitle.innerText = 'Account Security';
      loadSecurityView(contentArea);
      break;
    case 'sessions':
      if (headerTitle) headerTitle.innerText = 'Active Sessions';
      loadSessionsView(contentArea);
      break;
    case 'profile':
      if (headerTitle) headerTitle.innerText = 'My Profile';
      loadProfileView(contentArea);
      break;
    case 'settings':
      if (headerTitle) headerTitle.innerText = 'System Settings';
      loadSettingsView(contentArea);
      break;
    case '403':
      if (headerTitle) headerTitle.innerText = 'Access Denied';
      loadAccessDeniedView(contentArea);
      break;
    case '404':
    default:
      if (headerTitle) headerTitle.innerText = 'Page Not Found';
      loadNotFoundView(contentArea);
      break;
  }
}

// App Initialization
async function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Global tab switch listener
  window.addEventListener('switch-tab', (e: any) => {
    if (e.detail?.tab) {
      router.navigate(`/${e.detail.tab}`);
    }
  });

  // Subscribe to router location changes
  router.subscribe((match) => {
    const authState = authStore.getState();
    if (!authState.isLoading && authState.user) {
      renderRoute(match);
    }
  });

  // Listen to auth store state changes
  authStore.subscribe((state) => {
    if (state.isLoading) {
      renderLoading(app);
    } else if (!state.user) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/' && !currentPath.startsWith('/login')) {
        router.setReturnUrl(currentPath + window.location.search);
      }
      if (window.location.pathname !== '/login') {
        router.navigate('/login', { replace: true });
      }
      document.body.className = 'login-page';
      renderLogin(app);
    } else {
      document.body.className = 'dashboard-page';
      const shellMounted = document.querySelector('.app-shell');
      if (!shellMounted) {
        renderDashboardShell(app, state.user, () => {
          openAddEmployeeModal(() => renderRoute(router.getCurrentMatch()));
        });
      }

      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/') {
        const target = router.getReturnUrl() || '/dashboard';
        router.setReturnUrl(null);
        router.navigate(target, { replace: true });
      } else {
        renderRoute(router.getCurrentMatch());
      }
    }
  });

  // Verify existing session via /api/v1/auth/me
  await authStore.bootstrap();
}

// Boot application
initApp();
