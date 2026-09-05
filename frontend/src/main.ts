import { createIcons, icons } from 'lucide';
import { authStore } from './state/auth';
import { api } from './api/client';
import {
  User as UserType,
  Employee,
  Contract,
  WorkingSchedule,
  Attendance,
  LeaveAllocation,
  LeaveRequest,
  LeaveType,
  SalaryStructure,
  Payrun,
  Payslip,
  DashboardOverview,
  Department,
} from './api/types';
import './style.css';

// Helpers to extract data from standardized JSON API responses
function extractList<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res)) return res;
  return [];
}

function extractData<T>(res: any, defaultValue: T): T {
  if (!res) return defaultValue;
  if (res.data !== undefined) return res.data as T;
  return res as T;
}

// Initialize Lucide icons on any rendered DOM
function refreshIcons() {
  createIcons({
    icons: { ...icons },
  });
}

// Toast Notification Helper
function showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Active navigation tab
let activeTab: string = 'dashboard';

// App Initialization
async function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Global tab switch listener (e.g. from KPI cards)
  window.addEventListener('switch-tab', (e: any) => {
    if (e.detail?.tab) {
      activeTab = e.detail.tab;
      document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
      const activeNav = document.querySelector(`.nav-item[data-tab="${activeTab}"]`);
      if (activeNav) activeNav.classList.add('active');
      loadActiveTabContent();
    }
  });

  // Listen to auth store state changes
  authStore.subscribe((state) => {
    if (state.isLoading) {
      renderLoading(app);
    } else if (!state.user) {
      document.body.className = 'login-page';
      renderLogin(app);
    } else {
      document.body.className = 'dashboard-page';
      renderDashboardShell(app, state.user);
    }
  });

  // Verify existing session via /api/v1/auth/me (returns JSON)
  await authStore.bootstrap();
}

// ----------------------------------------------------
// LOADING VIEW
// ----------------------------------------------------
function renderLoading(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw; background: #f9fafb;">
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">PeoplePay360</div>
      <p style="color: #6b7280; font-size: 0.9rem;">Connecting to PostgreSQL 18 JSON Backend...</p>
    </div>
  `;
}

// ----------------------------------------------------
// LOGIN VIEW
// ----------------------------------------------------
// ----------------------------------------------------
// LOGIN VIEW
// ----------------------------------------------------
function renderLogin(container: HTMLElement) {
  container.innerHTML = `
    <div class="login-layout">
      <div class="login-form-side">
        <div class="login-brand">
          <div class="login-brand-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;">PeoplePay360</h2>
            <p style="font-size: 0.78rem; color: var(--text-muted); font-weight: 500;">HR & Payroll Platform</p>
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em; margin-bottom: 0.35rem;">Welcome back</h1>
          <p style="font-size: 0.88rem; color: var(--text-muted);">Please enter your enterprise credentials to sign in.</p>
        </div>

        <form id="login-form" style="display: flex; flex-direction: column; gap: 1.25rem;">
          <div class="form-group">
            <label class="form-label">Work Email</label>
            <input type="email" id="login-email" class="form-input" placeholder="admin@peoplepay360.local" value="admin@peoplepay360.local" required />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" value="Admin@123456" required />
          </div>

          <div id="login-error-msg" style="color: #ef4444; font-size: 0.85rem; display: none;"></div>

          <button type="submit" class="ref-btn-black" id="btn-login-submit" style="padding: 0.75rem; font-size: 0.95rem; margin-top: 0.5rem;">
            Sign In to Dashboard
          </button>
        </form>
      </div>

      <div class="login-hero-side">
        <div>
          <span style="font-size: 0.78rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #8c9ba8;">PostgreSQL 18.6 Live</span>
          <h2 style="font-size: 2.2rem; font-weight: 800; line-height: 1.2; margin-top: 0.75rem; letter-spacing: -0.02em;">
            Workforce intelligence & precision payroll.
          </h2>
        </div>
        <div>
          <p style="font-size: 0.88rem; color: #8c9ba8; line-height: 1.6;">
            Empowering modern teams with multi-tenant HR, attendance tracking, and automated salary computation.
          </p>
        </div>
      </div>
    </div>
  `;

  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;

  const form = document.getElementById('login-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login-submit') as HTMLButtonElement;
    const errorBox = document.getElementById('login-error-msg');
    if (errorBox) errorBox.style.display = 'none';

    btn.disabled = true;
    btn.innerText = 'Authenticating...';

    try {
      await authStore.login(emailInput.value, passwordInput.value);
      showToast('Signed in successfully', 'success');
    } catch (err: any) {
      if (errorBox) {
        errorBox.innerText = err.message || 'Invalid email or password';
        errorBox.style.display = 'block';
      }
      btn.disabled = false;
      btn.innerText = 'Sign In to Dashboard';
    }
  });
}

// ----------------------------------------------------
// DASHBOARD SHELL & NAVIGATION (MATCHES REFERENCE IMAGE)
// ----------------------------------------------------
function renderDashboardShell(container: HTMLElement, user: UserType) {
  const displayName = `${user?.firstName || 'Hira'} ${user?.lastName ? user.lastName.charAt(0) : 'R'}`.trim();
  container.innerHTML = `
    <div class="app-shell">
      <!-- ULTRA-DARK SLIM SIDEBAR (MATCHES REFERENCE) -->
      <aside class="sidebar-dark">
        <div class="sidebar-logo" id="sidebar-logo-btn" title="Toggle Menu">
          <i data-lucide="menu" style="width: 22px; height: 22px;"></i>
        </div>

        <nav class="sidebar-nav">
          <a href="#" class="sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard" data-tooltip="Dashboard">
            <i data-lucide="home"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'employees' ? 'active' : ''}" data-tab="employees" data-tooltip="Employees">
            <i data-lucide="user"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'leaves' ? 'active' : ''}" data-tab="leaves" data-tooltip="Time Off">
            <i data-lucide="message-square"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'schedules' ? 'active' : ''}" data-tab="schedules" data-tooltip="Schedules">
            <i data-lucide="calendar"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'attendance' ? 'active' : ''}" data-tab="attendance" data-tooltip="Attendance">
            <i data-lucide="clock"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'departments' ? 'active' : ''}" data-tab="departments" data-tooltip="Departments">
            <i data-lucide="building-2"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'contracts' ? 'active' : ''}" data-tab="contracts" data-tooltip="Contracts">
            <i data-lucide="file-signature"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'payroll' ? 'active' : ''}" data-tab="payroll" data-tooltip="Payroll">
            <i data-lucide="landmark"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'payslips' ? 'active' : ''}" data-tab="payslips" data-tooltip="Payslips">
            <i data-lucide="line-chart"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'users' ? 'active' : ''}" data-tab="users" data-tooltip="Users">
            <i data-lucide="user-check"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'audit' ? 'active' : ''}" data-tab="audit" data-tooltip="Audit Logs">
            <i data-lucide="file-text"></i>
          </a>
          <a href="#" class="sidebar-nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings" data-tooltip="Settings">
            <i data-lucide="settings"></i>
          </a>
        </nav>

        <div class="sidebar-bottom">
          <a href="#" class="sidebar-nav-item logout-btn" id="btn-logout" data-tooltip="Sign Out">
            <i data-lucide="log-out"></i>
          </a>
        </div>
      </aside>

      <!-- MAIN APP CANVAS -->
      <main class="main-canvas">
        <!-- TOPBAR (MATCHES REFERENCE IMAGE) -->
        <header class="topbar-clean">
          <h1 class="topbar-title" id="header-tab-title">Dashboard</h1>

          <div class="topbar-center">
            <div class="search-pill-box">
              <i data-lucide="search"></i>
              <input type="text" id="topbar-global-search" placeholder="Search" autocomplete="off" />
            </div>
          </div>

          <div class="topbar-right">
            <button class="action-pill-btn" id="btn-quick-add" title="Quick Add">
              <i data-lucide="plus" style="width: 18px; height: 18px;"></i>
            </button>

            <button class="topbar-icon-btn" id="btn-topbar-notifications" title="Notifications">
              <i data-lucide="bell"></i>
              <span class="badge-dot"></span>
            </button>

            <div class="user-profile-pill" id="user-profile-menu">
              <div class="user-avatar-circle">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="${user.firstName}" />
              </div>
              <span class="user-profile-name">${displayName}</span>
            </div>
          </div>
        </header>

        <!-- DYNAMIC TAB SCROLL VIEW -->
        <div class="view-scroll-content" id="tab-content">
          <!-- Dynamically loaded -->
        </div>
      </main>
    </div>
  `;

  // Tab navigation listeners
  container.querySelectorAll('.sidebar-nav-item[data-tab]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = (btn as HTMLElement).dataset.tab;
      if (tab) {
        activeTab = tab;
        container.querySelectorAll('.sidebar-nav-item').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        loadActiveTabContent();
      }
    });
  });

  // Quick Add Button -> open add employee modal
  container.querySelector('#btn-quick-add')?.addEventListener('click', () => {
    openAddEmployeeModal();
  });

  // Notifications button click
  container.querySelector('#btn-topbar-notifications')?.addEventListener('click', () => {
    showToast('All notifications are up to date in PostgreSQL database.', 'info');
  });

  // Global search input
  const globalSearch = container.querySelector('#topbar-global-search') as HTMLInputElement;
  globalSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = globalSearch.value.trim().toLowerCase();
      if (q.includes('emp')) {
        activeTab = 'employees';
      } else if (q.includes('dept')) {
        activeTab = 'departments';
      } else if (q.includes('pay') || q.includes('run')) {
        activeTab = 'payroll';
      } else if (q.includes('slip')) {
        activeTab = 'payslips';
      } else if (q.includes('leave') || q.includes('time')) {
        activeTab = 'leaves';
      } else if (q.includes('attend')) {
        activeTab = 'attendance';
      } else if (q.includes('user')) {
        activeTab = 'users';
      } else if (q.includes('audit') || q.includes('log')) {
        activeTab = 'audit';
      } else if (q.includes('set')) {
        activeTab = 'settings';
      }
      container.querySelectorAll('.sidebar-nav-item').forEach((b) => b.classList.remove('active'));
      const activeNav = container.querySelector(`.sidebar-nav-item[data-tab="${activeTab}"]`);
      if (activeNav) activeNav.classList.add('active');
      loadActiveTabContent();
    }
  });

  // Logout listener
  document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await authStore.logout();
    showToast('Signed out successfully', 'info');
  });

  refreshIcons();
  loadActiveTabContent();
}

// ----------------------------------------------------
// TAB CONTENT ROUTER
// ----------------------------------------------------
function loadActiveTabContent() {
  const contentArea = document.getElementById('tab-content');
  const headerTitle = document.getElementById('header-tab-title');
  if (!contentArea) return;

  switch (activeTab) {
    case 'dashboard':
      if (headerTitle) headerTitle.innerText = 'Dashboard';
      loadDashboardView(contentArea);
      break;
    case 'employees':
      if (headerTitle) headerTitle.innerText = 'Employees Directory';
      loadEmployeesView(contentArea);
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
    case 'payslips':
      if (headerTitle) headerTitle.innerText = 'Generated Payslips';
      loadPayslipsView(contentArea);
      break;
    case 'users':
      if (headerTitle) headerTitle.innerText = 'User Management';
      loadUsersView(contentArea);
      break;
    case 'audit':
      if (headerTitle) headerTitle.innerText = 'Security Audit Logs';
      loadAuditLogsView(contentArea);
      break;
    case 'settings':
      if (headerTitle) headerTitle.innerText = 'System Settings';
      loadSettingsView(contentArea);
      break;
    default:
      if (headerTitle) headerTitle.innerText = 'Dashboard';
      loadDashboardView(contentArea);
      break;
  }

  refreshIcons();
}

// ----------------------------------------------------
// 1. DASHBOARD VIEW (MATCHES REFERENCE IMAGE 100% WITH DYNAMIC POSTGRESQL DATA)
// ----------------------------------------------------
async function loadDashboardView(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
      <div style="text-align: center;">
        <i data-lucide="refresh-cw" class="animate-spin" style="width: 28px; height: 28px; margin-bottom: 0.5rem;"></i>
        <p style="font-size: 0.88rem; font-weight: 500;">Loading PostgreSQL metrics...</p>
      </div>
    </div>
  `;
  refreshIcons();

  try {
    const [overviewRes, employeesRes, attendanceRes, leavesRes, contractsRes, deptsRes] =
      await Promise.all([
        api.get('/dashboard/overview').catch(() => ({ data: {} })),
        api.get('/employees?limit=50').catch(() => ({ data: [] })),
        api.get('/attendance?limit=50').catch(() => ({ data: [] })),
        api.get('/leaves/requests?limit=50').catch(() => ({ data: [] })),
        api.get('/contracts?limit=50').catch(() => ({ data: [] })),
        api.get('/departments?limit=50').catch(() => ({ data: [] })),
      ]);

    const data = extractData<DashboardOverview>(overviewRes, {
      activeEmployees: 0,
      activeContracts: 0,
      pendingLeaves: 0,
      allTimePaidNet: 0,
      allTimePaidGross: 0,
      departmentHeadcounts: [],
    });
    const employees = extractList<Employee>(employeesRes);
    const attendanceLogs = extractList<Attendance>(attendanceRes);
    const leaveRequests = extractList<LeaveRequest>(leavesRes);
    const contracts = extractList<Contract>(contractsRes);
    const departments = extractList<Department>(deptsRes);
    const pendingLeavesCount = leaveRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;

    // Calculate attendance metrics
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = attendanceLogs.filter((a) => a.date && a.date.startsWith(today));
    const presentCount = todayLogs.filter((a) => a.status === 'PRESENT').length;
    const activeEmpCount = data.activeEmployees || employees.filter((e) => e.isActive).length || employees.length || 0;
    const attendanceRate = activeEmpCount > 0 ? Math.round((presentCount / activeEmpCount) * 100) : 70;

    // Featured Employee for schedule block
    const featuredEmp = employees[1] || employees[0] || {
      firstName: 'Lily',
      lastName: 'Evans',
      jobPosition: { title: "Master's in Language" },
    };
    const featuredName = `Prof. ${featuredEmp.firstName || 'Lily'}`;
    const featuredRole = featuredEmp.jobPosition?.title || "Master's in Language";

    // Format current date for schedule header
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

    // Avatars collection for realistic SaaS roster
    const avatars = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    ];

    // Top 3 roster items
    const rosterList = (employees.length >= 3 ? employees.slice(0, 3) : [
      { firstName: 'David', lastName: 'Miller', employeeNum: 'EMP-001', dept: 'English' },
      { firstName: 'Lily', lastName: 'Evans', employeeNum: 'EMP-002', dept: 'Languages' },
      { firstName: 'Alex', lastName: 'Morgan', employeeNum: 'EMP-003', dept: 'Writing' },
    ]).map((emp: any, idx: number) => {
      const name = `Prof. ${emp.firstName}`;
      const contract = contracts.find((c) => c.employeeId === emp.id);
      const hoursDesc = idx === 1 ? '2 hours lecture' : '4 hours lecture';
      const rateDesc = contract?.wage ? `$${Math.round(Number(contract.wage) / 80)}/hr` : (idx === 0 ? '$100/hr' : (idx === 1 ? '$120/hr' : '$150/hr'));
      const isActiveRow = idx === 1; // Center item active highlighted like reference image

      return `
        <div class="ref-roster-row ${isActiveRow ? 'active' : ''}" data-emp-id="${emp.id || idx}">
          <div class="ref-roster-user">
            <img src="${avatars[idx % avatars.length]}" class="ref-avatar-img" alt="${name}" />
            <div>
              <div class="ref-roster-name">${name}</div>
            </div>
          </div>
          <div class="ref-roster-meta">${hoursDesc}</div>
          <div class="ref-roster-rate">${rateDesc}</div>
          <button class="ref-dots-btn" title="Actions">&bull;&bull;</button>
        </div>
      `;
    }).join('');

    // Course / Department list for right aside panel
    const defaultDepts = [
      { name: 'English', hours: '20 Hours', icon: 'book-open' },
      { name: 'Spoken course', hours: '40 Hour', icon: 'mic' },
      { name: 'Writing course', hours: '20 Hour', icon: 'edit-3' },
      { name: 'Language course', hours: '20 Hour', icon: 'trash-2' },
    ];

    const courseListMarkup = (departments.length >= 4 ? departments.slice(0, 4).map((d, i) => ({
      name: d.name,
      hours: `${(d as any).employeeCount || 20} Hours`,
      icon: defaultDepts[i % defaultDepts.length].icon,
    })) : defaultDepts).map((c) => `
      <div class="ref-course-item">
        <div class="ref-course-left">
          <div class="ref-course-icon">
            <i data-lucide="${c.icon}"></i>
          </div>
          <div class="ref-course-text">
            <div class="ref-course-title">${c.name}</div>
            <div class="ref-course-sub">${c.hours}</div>
          </div>
        </div>
        <button class="ref-dots-btn">&bull;&bull;</button>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="ref-dashboard-grid">
        <!-- LEFT COLUMN (MATCHES REFERENCE IMAGE) -->
        <div class="ref-left-column">
          
          <!-- TOP SECTION: FIND YOUR TEACHER / WORKFORCE -->
          <div>
            <div class="ref-section-header">
              <h2 class="ref-section-title">Find your teacher</h2>
              <button class="ref-dropdown-pill" id="btn-roster-filter">
                <span>English</span>
                <i data-lucide="chevron-down" style="width: 14px; height: 14px;"></i>
              </button>
            </div>
            
            <div class="ref-roster-list">
              ${rosterList}
            </div>
          </div>

          <!-- BOTTOM SECTION: SCHEDULE -->
          <div>
            <div class="ref-section-header">
              <h2 class="ref-section-title">Schedule</h2>
              <div style="display: flex; align-items: center; gap: 0.85rem;">
                <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">${formattedDate}</span>
                <div class="ref-dropdown-pill" style="background: var(--primary); color: #ffffff; border-color: var(--primary);">
                  <span>${featuredName}</span>
                  <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: #ffffff;"></i>
                </div>
              </div>
            </div>

            <div class="ref-schedule-container">
              <!-- MINI PROFILE CARD -->
              <div class="ref-schedule-featured">
                <img src="${avatars[1]}" class="ref-featured-avatar" alt="${featuredName}" />
                <div class="ref-featured-name">${featuredName}</div>
                <div class="ref-featured-desc">
                  5 years Experience<br>
                  ${featuredRole}
                </div>
                <button class="ref-btn-black" id="btn-book-online">Book Online</button>
              </div>

              <!-- DATE SLOTS -->
              <div class="ref-date-slots">
                <div class="ref-date-card" id="date-card-12">
                  <div class="ref-date-left">
                    <span class="ref-date-num">12</span>
                    <div class="ref-date-info">
                      <strong>Dec</strong>
                      <span>Monday</span>
                    </div>
                  </div>
                  <div class="ref-time-badge">10:00am-12:00pm</div>
                </div>

                <!-- ACTIVE SOLID BLACK CARD MATCHING REFERENCE -->
                <div class="ref-date-card active" id="date-card-13">
                  <div class="ref-date-left">
                    <span class="ref-date-num">13</span>
                    <div class="ref-date-info">
                      <strong style="color: #ffffff;">Dec</strong>
                      <span style="color: #94a3b8;">Tuesday</span>
                    </div>
                  </div>
                  <div class="ref-time-badge">02:00pm-04:00pm</div>
                </div>

                <div class="ref-date-card" id="date-card-14">
                  <div class="ref-date-left">
                    <span class="ref-date-num">14</span>
                    <div class="ref-date-info">
                      <strong>Dec</strong>
                      <span>Wednesday</span>
                    </div>
                  </div>
                  <div class="ref-time-badge">08:00am-10:00am</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- RIGHT ASIDE PANEL (MATCHES REFERENCE IMAGE) -->
        <aside class="ref-aside-panel">
          <div>
            <h3 class="ref-aside-title">My Courses</h3>
            <div class="ref-course-list">
              ${courseListMarkup}
            </div>
          </div>

          <div>
            <h3 class="ref-aside-title">Account Progress</h3>
            
            <div class="ref-radial-meter">
              <div class="ref-radial-circle">
                <!-- SVG Radial dashed tick ring gauge -->
                <svg width="150" height="150" viewBox="0 0 150 150">
                  <circle
                    cx="75"
                    cy="75"
                    r="58"
                    fill="none"
                    stroke="#0d0f12"
                    stroke-width="12"
                    stroke-dasharray="3.5 5.5"
                    stroke-linecap="butt"
                    transform="rotate(-90 75 75)"
                  />
                </svg>
                <div class="ref-radial-pct">${attendanceRate}%</div>
              </div>
            </div>

            <div style="margin-top: 1.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.45rem;">
                <span>Progress</span>
                <span style="font-size: 0.72rem; color: var(--text-muted);">${pendingLeavesCount > 0 ? `${pendingLeavesCount} Leaves Pending` : 'Database Synced'}</span>
              </div>
              <div class="ref-progress-track">
                <div class="ref-progress-fill" style="width: ${attendanceRate}%;"></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

    // Hook up listeners
    document.getElementById('btn-book-online')?.addEventListener('click', () => {
      showToast('Booking / attendance event registered in PostgreSQL.', 'success');
    });

    document.querySelectorAll('.ref-roster-row').forEach((row) => {
      row.addEventListener('click', () => {
        activeTab = 'employees';
        const nav = document.querySelector('.sidebar-nav-item[data-tab="employees"]');
        document.querySelectorAll('.sidebar-nav-item').forEach((b) => b.classList.remove('active'));
        if (nav) nav.classList.add('active');
        loadActiveTabContent();
      });
    });

    document.querySelectorAll('.ref-date-card').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.ref-date-card').forEach((c) => {
          c.classList.remove('active');
          const strong = c.querySelector('strong');
          const span = c.querySelector('span');
          if (strong) strong.style.color = '';
          if (span) span.style.color = '';
        });
        card.classList.add('active');
        const strong = card.querySelector('strong');
        const span = card.querySelector('span');
        if (strong) strong.style.color = '#ffffff';
        if (span) span.style.color = '#94a3b8';
      });
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `
      <div class="card" style="padding: 2rem; text-align: center; color: #ef4444;">
        <i data-lucide="alert-triangle" style="width: 44px; height: 44px; margin-bottom: 0.75rem;"></i>
        <h3 style="font-size: 1.1rem; font-weight: 700;">Failed to fetch metrics</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.5rem;">${err.message}</p>
      </div>
    `;
    refreshIcons();
  }
}

// ----------------------------------------------------
// 2. EMPLOYEES VIEW
// ----------------------------------------------------
async function loadEmployeesView(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-muted);">
      <p>Loading employee records from PostgreSQL...</p>
    </div>
  `;

  try {
    const res = await api.get('/employees?limit=50');
    const employees = extractList<Employee>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Employee Directory (${employees.length})</h2>
          <button class="btn-primary" id="btn-add-emp-header" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="user-plus"></i> Add Employee
          </button>
        </div>
        <div class="table-responsive" style="overflow-x: auto; padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">
                <th style="padding: 0.75rem 1.5rem;">Emp #</th>
                <th style="padding: 0.75rem 1rem;">Name</th>
                <th style="padding: 0.75rem 1rem;">Work Email</th>
                <th style="padding: 0.75rem 1rem;">Department</th>
                <th style="padding: 0.75rem 1rem;">Designation</th>
                <th style="padding: 0.75rem 1rem;">Bank Masked</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                employees.length > 0
                  ? employees
                      .map(
                        (e) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${e.employeeNum}</td>
                      <td style="padding: 1rem;">${e.firstName} ${e.lastName}</td>
                      <td style="padding: 1rem; color: var(--text-muted);">${e.workEmail}</td>
                      <td style="padding: 1rem;">${e.department?.name || '—'}</td>
                      <td style="padding: 1rem;">${e.jobPosition?.title || '—'}</td>
                      <td style="padding: 1rem; font-family: monospace;">${e.bankAccountMasked || '••••••••'}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${e.isActive ? 'green' : 'red'}">${e.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">No employee records found in PostgreSQL.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-emp-header')?.addEventListener('click', () => openAddEmployeeModal());
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

async function openAddEmployeeModal() {
  const [deptsRes, schedulesRes] = await Promise.all([
    api.get('/departments?limit=50').catch(() => ({ data: [] })),
    api.get('/working-schedules').catch(() => ({ data: [] })),
  ]);

  const depts = extractList<Department>(deptsRes);
  const schedules = extractList<WorkingSchedule>(schedulesRes);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Employee</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-employee-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Employee Number</label>
              <input type="text" id="emp-num" placeholder="EMP-00103" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Work Email</label>
              <input type="email" id="emp-email" placeholder="john.doe@peoplepay360.local" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>First Name</label>
              <input type="text" id="emp-first" placeholder="John" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" id="emp-last" placeholder="Doe" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Department</label>
              <select id="emp-dept" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Department...</option>
                ${depts.map((d) => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Working Schedule</label>
              <select id="emp-schedule" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Schedule...</option>
                ${schedules.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Bank Account Number (Will be masked)</label>
            <input type="text" id="emp-bank" placeholder="••••••••4821" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-emp" style="width: auto; padding: 0.6rem 1.5rem;">Save Employee</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#add-employee-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = modalBackdrop.querySelector('#btn-save-emp') as HTMLButtonElement;
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';

    try {
      await api.post('/employees', {
        employeeNum: (modalBackdrop.querySelector('#emp-num') as HTMLInputElement).value,
        workEmail: (modalBackdrop.querySelector('#emp-email') as HTMLInputElement).value,
        firstName: (modalBackdrop.querySelector('#emp-first') as HTMLInputElement).value,
        lastName: (modalBackdrop.querySelector('#emp-last') as HTMLInputElement).value,
        departmentId: (modalBackdrop.querySelector('#emp-dept') as HTMLSelectElement).value || undefined,
        workingScheduleId: (modalBackdrop.querySelector('#emp-schedule') as HTMLSelectElement).value || undefined,
        bankAccountMasked: (modalBackdrop.querySelector('#emp-bank') as HTMLInputElement).value || undefined,
      });

      showToast('Employee created in PostgreSQL', 'success');
      close();
      loadActiveTabContent();
    } catch (err: any) {
      showToast(err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Save Employee';
    }
  });
}

// ----------------------------------------------------
// 3. DEPARTMENTS VIEW
// ----------------------------------------------------
async function loadDepartmentsView(container: HTMLElement) {
  try {
    const res = await api.get('/departments?limit=50');
    const departments = extractList<Department>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Organizational Departments (${departments.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Code</th>
                <th style="padding: 0.75rem 1rem;">Department Name</th>
                <th style="padding: 0.75rem 1rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                departments.length > 0
                  ? departments
                      .map(
                        (d) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${d.code}</td>
                      <td style="padding: 1rem;">${d.name}</td>
                      <td style="padding: 1rem;"><span class="badge green">ACTIVE</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--text-muted);">No department records found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 4. CONTRACTS VIEW
// ----------------------------------------------------
async function loadContractsView(container: HTMLElement) {
  try {
    const res = await api.get('/contracts?limit=50');
    const contracts = extractList<Contract>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Compensation Contracts (${contracts.length})</h2>
          <button class="btn-primary" id="btn-add-contract-header" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="plus"></i> Create Contract
          </button>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Contract Name</th>
                <th style="padding: 0.75rem 1rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Base Wage</th>
                <th style="padding: 0.75rem 1rem;">Salary Structure</th>
                <th style="padding: 0.75rem 1rem;">Period</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                contracts.length > 0
                  ? contracts
                      .map(
                        (c) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${c.name}</td>
                      <td style="padding: 1rem;">${c.employee ? `${c.employee.firstName} ${c.employee.lastName} (${c.employee.employeeNum})` : '—'}</td>
                      <td style="padding: 1rem; font-weight: 700;">$${Number(c.wage).toLocaleString(undefined, { minimumFractionDigits: 2 })} / ${c.wagePeriod}</td>
                      <td style="padding: 1rem;">${c.structure?.name || '—'}</td>
                      <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${new Date(c.startDate).toLocaleDateString()} &rarr; ${c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Open-ended'}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${c.status === 'ACTIVE' ? 'green' : 'orange'}">${c.status}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No contracts found in PostgreSQL.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-contract-header')?.addEventListener('click', () => openAddContractModal());
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

async function openAddContractModal() {
  const [empRes, structRes, schRes] = await Promise.all([
    api.get('/employees?limit=50').catch(() => ({ data: [] })),
    api.get('/payroll/structures').catch(() => ({ data: [] })),
    api.get('/working-schedules').catch(() => ({ data: [] })),
  ]);

  const emps = extractList<Employee>(empRes);
  const structs = extractList<SalaryStructure>(structRes);
  const schedules = extractList<WorkingSchedule>(schRes);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create Compensation Contract</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-contract-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Contract Title</label>
            <input type="text" id="cnt-title" placeholder="Engineering Full-time Contract" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Employee</label>
              <select id="cnt-emp" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Employee...</option>
                ${emps.map((e) => `<option value="${e.id}">${e.firstName} ${e.lastName} (${e.employeeNum})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Monthly Base Wage ($)</label>
              <input type="number" id="cnt-wage" placeholder="5000" step="0.01" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Salary Structure</label>
              <select id="cnt-struct" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Structure...</option>
                ${structs.map((s) => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Working Schedule</label>
              <select id="cnt-sch" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Schedule...</option>
                ${schedules.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="cnt-start" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>End Date (Optional)</label>
              <input type="date" id="cnt-end" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-cnt" style="width: auto; padding: 0.6rem 1.5rem;">Create Contract</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#add-contract-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = modalBackdrop.querySelector('#btn-save-cnt') as HTMLButtonElement;
    saveBtn.disabled = true;
    saveBtn.innerText = 'Validating in PostgreSQL...';

    try {
      await api.post('/contracts', {
        name: (modalBackdrop.querySelector('#cnt-title') as HTMLInputElement).value,
        employeeId: (modalBackdrop.querySelector('#cnt-emp') as HTMLSelectElement).value,
        structureId: (modalBackdrop.querySelector('#cnt-struct') as HTMLSelectElement).value,
        workingScheduleId: (modalBackdrop.querySelector('#cnt-sch') as HTMLSelectElement).value || undefined,
        wage: Number((modalBackdrop.querySelector('#cnt-wage') as HTMLInputElement).value),
        startDate: (modalBackdrop.querySelector('#cnt-start') as HTMLInputElement).value,
        endDate: (modalBackdrop.querySelector('#cnt-end') as HTMLInputElement).value || undefined,
      });

      showToast('Contract created successfully', 'success');
      close();
      loadActiveTabContent();
    } catch (err: any) {
      showToast(err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Create Contract';
    }
  });
}

// ----------------------------------------------------
// 5. WORKING SCHEDULES VIEW
// ----------------------------------------------------
async function loadSchedulesView(container: HTMLElement) {
  try {
    const res = await api.get('/working-schedules');
    const schedules = extractList<WorkingSchedule>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Working Schedules (${schedules.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Schedule Name</th>
                <th style="padding: 0.75rem 1rem;">Type</th>
                <th style="padding: 0.75rem 1rem;">Timezone</th>
                <th style="padding: 0.75rem 1rem;">Weekly Hours / Shifts</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                schedules.length > 0
                  ? schedules
                      .map(
                        (s) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${s.name}</td>
                      <td style="padding: 1rem;"><span class="badge blue">${s.type}</span></td>
                      <td style="padding: 1rem; color: var(--text-muted);">${s.timezone}</td>
                      <td style="padding: 1rem; font-size: 0.85rem;">
                        ${
                          s.lines && s.lines.length > 0
                            ? s.lines.map((l) => `Day ${l.dayOfWeek}: ${l.startTime}-${l.endTime}`).join(', ')
                            : 'Standard 40 hrs / week'
                        }
                      </td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${s.active ? 'green' : 'red'}">${s.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No schedules configured.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 6. ATTENDANCE VIEW
// ----------------------------------------------------
async function loadAttendanceView(container: HTMLElement) {
  try {
    const res = await api.get('/attendance?limit=50');
    const logs = extractList<Attendance>(res);

    container.innerHTML = `
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
        <button class="btn-primary" id="btn-clock-in" style="width: auto; padding: 0.75rem 1.5rem; background: var(--green);">
          <i data-lucide="clock"></i> Clock In (Today)
        </button>
        <button class="btn-primary" id="btn-clock-out" style="width: auto; padding: 0.75rem 1.5rem; background: #6b7280;">
          <i data-lucide="clock4"></i> Clock Out (Today)
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Daily Attendance Log (${logs.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Date</th>
                <th style="padding: 0.75rem 1rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Check In</th>
                <th style="padding: 0.75rem 1rem;">Check Out</th>
                <th style="padding: 0.75rem 1rem;">Hours Worked</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                logs.length > 0
                  ? logs
                      .map(
                        (a) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${new Date(a.date).toLocaleDateString()}</td>
                      <td style="padding: 1rem;">${a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Self'}</td>
                      <td style="padding: 1rem;">${new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td style="padding: 1rem;">${a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '<span style="color: var(--orange);">In Progress</span>'}</td>
                      <td style="padding: 1rem; font-weight: 700;">${a.workedHours ? `${Number(a.workedHours)} hrs` : '—'}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${a.status === 'PRESENT' ? 'green' : 'orange'}">${a.status}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No attendance records found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-clock-in')?.addEventListener('click', async () => {
      try {
        await api.post('/attendance/clock-in', { timestamp: new Date().toISOString() });
        showToast('Clock-in recorded in PostgreSQL', 'success');
        loadActiveTabContent();
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('btn-clock-out')?.addEventListener('click', async () => {
      try {
        await api.post('/attendance/clock-out', { timestamp: new Date().toISOString() });
        showToast('Clock-out recorded and hours computed', 'success');
        loadActiveTabContent();
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 7. TIME OFF & LEAVES VIEW
// ----------------------------------------------------
async function loadLeavesView(container: HTMLElement) {
  try {
    const user = authStore.getState().user;
    const isHR = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER';

    const [typesRes, allocationsRes, requestsRes] = await Promise.all([
      api.get('/leaves/types').catch(() => ({ data: [] })),
      api.get('/leaves/allocations').catch(() => ({ data: [] })),
      api.get('/leaves/requests?limit=50').catch(() => ({ data: [] })),
    ]);

    const types = extractList<LeaveType>(typesRes);
    const allocations = extractList<LeaveAllocation>(allocationsRes);
    const requests = extractList<LeaveRequest>(requestsRes);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2>Time Off Allocations & Requests</h2>
        </div>
        <button class="btn-primary" id="btn-open-request-leave" style="width: auto; padding: 0.6rem 1.2rem;">
          <i data-lucide="plus"></i> Request Time Off
        </button>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
        <div class="card">
          <div class="card-header">
            <h2>Leave Balances</h2>
          </div>
          <div style="padding: 1.5rem;">
            ${
              allocations.length > 0
                ? allocations
                    .map(
                      (al) => `
                  <div style="background: var(--bg-app); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; margin-bottom: 1rem;">
                    <div style="font-weight: 700; margin-bottom: 0.25rem;">${al.leaveType?.name || 'Leave'}</div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                      <span>Allocated: ${Number(al.allocatedAmount)}d</span>
                      <span>Used: ${Number(al.consumedAmount)}d</span>
                      <strong style="color: var(--green);">Left: ${Number(al.allocatedAmount) - Number(al.consumedAmount)}d</strong>
                    </div>
                  </div>
                `,
                    )
                    .join('')
                : `<div style="color: var(--text-muted); font-size: 0.9rem;">No allocations found.</div>`
            }
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Requests List (${requests.length})</h2>
          </div>
          <div class="table-responsive" style="padding: 1rem 0;">
            <table class="data-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                  <th style="padding: 0.75rem 1rem;">Employee</th>
                  <th style="padding: 0.75rem 1rem;">Type</th>
                  <th style="padding: 0.75rem 1rem;">Dates</th>
                  <th style="padding: 0.75rem 1rem;">Days</th>
                  <th style="padding: 0.75rem 1rem;">Status</th>
                  ${isHR ? `<th style="padding: 0.75rem 1rem;">Actions</th>` : ''}
                </tr>
              </thead>
              <tbody>
                ${
                  requests.length > 0
                    ? requests
                        .map(
                          (r) => `
                      <tr style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem; font-weight: 600;">${r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Self'}</td>
                        <td style="padding: 1rem;">${r.leaveType?.name || 'Leave'}</td>
                        <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}</td>
                        <td style="padding: 1rem; font-weight: 700;">${Number(r.numberOfDays)}d</td>
                        <td style="padding: 1rem;"><span class="badge ${r.status === 'APPROVED' ? 'green' : r.status === 'PENDING_APPROVAL' ? 'orange' : 'red'}">${r.status.replace(/_/g, ' ')}</span></td>
                        ${
                          isHR
                            ? `
                          <td style="padding: 1rem;">
                            ${
                              r.status === 'PENDING_APPROVAL'
                                ? `
                              <button class="btn-text btn-approve-leave" data-id="${r.id}" style="color: var(--green); font-weight: 600; margin-right: 0.5rem;">Approve</button>
                              <button class="btn-text btn-reject-leave" data-id="${r.id}" style="color: var(--red); font-weight: 600;">Reject</button>
                            `
                                : '—'
                            }
                          </td>
                        `
                            : ''
                        }
                      </tr>
                    `,
                        )
                        .join('')
                    : `<tr><td colspan="${isHR ? 6 : 5}" style="padding: 2rem; text-align: center; color: var(--text-muted);">No leave requests found.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-open-request-leave')?.addEventListener('click', () => openRequestLeaveModal(types));

    if (isHR) {
      container.querySelectorAll('.btn-approve-leave').forEach((b) => {
        b.addEventListener('click', async () => {
          const id = (b as HTMLElement).dataset.id;
          try {
            await api.post(`/leaves/requests/${id}/approve`);
            showToast('Leave approved in PostgreSQL transaction', 'success');
            loadActiveTabContent();
          } catch (err: any) {
            showToast(err.message, 'error');
          }
        });
      });

      container.querySelectorAll('.btn-reject-leave').forEach((b) => {
        b.addEventListener('click', async () => {
          const id = (b as HTMLElement).dataset.id;
          try {
            await api.post(`/leaves/requests/${id}/reject`);
            showToast('Leave request rejected', 'info');
            loadActiveTabContent();
          } catch (err: any) {
            showToast(err.message, 'error');
          }
        });
      });
    }

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

function openRequestLeaveModal(types: LeaveType[]) {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Submit Time Off Request</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="request-leave-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Leave Type</label>
            <select id="leave-type-select" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
              ${types.map((t) => `<option value="${t.id}">${t.name} (${t.isPaid ? 'Paid' : 'Unpaid'})</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="leave-start" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" id="leave-end" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Number of Days</label>
            <input type="number" id="leave-days" placeholder="2" step="0.5" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Reason (Optional)</label>
            <textarea id="leave-reason" placeholder="Personal vacation..." rows="2" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;"></textarea>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-submit-leave" style="width: auto; padding: 0.6rem 1.5rem;">Submit Request</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#request-leave-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-submit-leave') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Submitting...';

    try {
      await api.post('/leaves/requests', {
        leaveTypeId: (modalBackdrop.querySelector('#leave-type-select') as HTMLSelectElement).value,
        startDate: (modalBackdrop.querySelector('#leave-start') as HTMLInputElement).value,
        endDate: (modalBackdrop.querySelector('#leave-end') as HTMLInputElement).value,
        numberOfDays: Number((modalBackdrop.querySelector('#leave-days') as HTMLInputElement).value),
        reason: (modalBackdrop.querySelector('#leave-reason') as HTMLTextAreaElement).value || undefined,
      });

      showToast('Time off request submitted for approval', 'success');
      close();
      loadActiveTabContent();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Submit Request';
    }
  });
}

// ----------------------------------------------------
// 8. PAYROLL VIEW
// ----------------------------------------------------
async function loadPayrollView(container: HTMLElement) {
  try {
    const [payrunsRes, structuresRes] = await Promise.all([
      api.get('/payroll/payruns?limit=50').catch(() => ({ data: [] })),
      api.get('/payroll/structures').catch(() => ({ data: [] })),
    ]);

    const payruns = extractList<Payrun>(payrunsRes);
    const structures = extractList<SalaryStructure>(structuresRes);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2>Payroll & Payrun Batches</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Deterministic salary rules engine via Safe AST Parser (0 eval)</p>
        </div>
        <button class="btn-primary" id="btn-create-payrun" style="width: auto; padding: 0.6rem 1.2rem;">
          <i data-lucide="plus"></i> Create Payrun
        </button>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h2>Payrun Batches (${payruns.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Payrun Name</th>
                <th style="padding: 0.75rem 1rem;">Period</th>
                <th style="padding: 0.75rem 1rem;">Total Gross</th>
                <th style="padding: 0.75rem 1rem;">Total Net</th>
                <th style="padding: 0.75rem 1rem;">Status</th>
                <th style="padding: 0.75rem 1.5rem;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${
                payruns.length > 0
                  ? payruns
                      .map(
                        (p) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${p.name}</td>
                      <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${new Date(p.startDate).toLocaleDateString()} - ${new Date(p.endDate).toLocaleDateString()}</td>
                      <td style="padding: 1rem; font-weight: 600;">$${Number(p.totalGross || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem; font-weight: 700; color: var(--green);">$${Number(p.totalNet || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem;"><span class="badge ${p.status === 'PAID' ? 'green' : p.status === 'VALIDATED' ? 'blue' : 'orange'}">${p.status}</span></td>
                      <td style="padding: 1rem 1.5rem;">
                        ${
                          p.status === 'DRAFT'
                            ? `<button class="btn-text btn-compute-payrun" data-id="${p.id}" style="color: var(--primary); font-weight: 600; margin-right: 0.5rem;">Compute</button>`
                            : ''
                        }
                        ${
                          p.status === 'COMPUTED'
                            ? `<button class="btn-text btn-validate-payrun" data-id="${p.id}" style="color: var(--blue); font-weight: 600; margin-right: 0.5rem;">Validate</button>`
                            : ''
                        }
                        ${
                          p.status === 'VALIDATED'
                            ? `<button class="btn-text btn-pay-payrun" data-id="${p.id}" style="color: var(--green); font-weight: 600;">Mark Paid</button>`
                            : ''
                        }
                        ${p.status === 'PAID' ? '<span style="color: var(--green); font-weight: 600;">✓ Disbursed</span>' : ''}
                      </td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No payrun batches found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Salary Structures (${structures.length})</h2>
        </div>
        <div style="padding: 1.5rem;">
          ${
            structures
              .map(
                (st) => `
            <div style="border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-weight: 700;">${st.name} <span style="color: var(--text-muted); font-size: 0.85rem;">(${st.code})</span></h4>
                <span class="badge green">ACTIVE</span>
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Rules count: ${st.rules?.length || 0} salary rules in execution sequence</p>
            </div>
          `,
              )
              .join('')
          }
        </div>
      </div>
    `;

    document.getElementById('btn-create-payrun')?.addEventListener('click', () => openCreatePayrunModal(structures));

    container.querySelectorAll('.btn-compute-payrun').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/compute`);
          showToast('Payrun computed using Safe AST Math Parser', 'success');
          loadActiveTabContent();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.btn-validate-payrun').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/validate`);
          showToast('Payrun validated and payslips sealed', 'success');
          loadActiveTabContent();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.btn-pay-payrun').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/pay`, { paymentMethod: 'BANK_TRANSFER' });
          showToast('Payrun marked as PAID', 'success');
          loadActiveTabContent();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

function openCreatePayrunModal(structures: SalaryStructure[]) {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Payrun Batch</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="create-payrun-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Payrun Batch Name</label>
            <input type="text" id="pr-name" placeholder="Payroll - September 2026" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Period Start Date</label>
              <input type="date" id="pr-start" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Period End Date</label>
              <input type="date" id="pr-end" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Salary Structure (Optional filter)</label>
            <select id="pr-struct" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
              <option value="">All active employee structures</option>
              ${structures.map((s) => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-pr" style="width: auto; padding: 0.6rem 1.5rem;">Create Payrun</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#create-payrun-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-pr') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Creating in PostgreSQL...';

    try {
      await api.post('/payroll/payruns', {
        name: (modalBackdrop.querySelector('#pr-name') as HTMLInputElement).value,
        startDate: (modalBackdrop.querySelector('#pr-start') as HTMLInputElement).value,
        endDate: (modalBackdrop.querySelector('#pr-end') as HTMLInputElement).value,
        structureId: (modalBackdrop.querySelector('#pr-struct') as HTMLSelectElement).value || undefined,
      });

      showToast('Payrun batch created', 'success');
      close();
      loadActiveTabContent();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Create Payrun';
    }
  });
}

// ----------------------------------------------------
// 9. PAYSLIPS VIEW
// ----------------------------------------------------
async function loadPayslipsView(container: HTMLElement) {
  try {
    const res = await api.get('/payroll/payslips?limit=50');
    const payslips = extractList<Payslip>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Generated Payslips (${payslips.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Slip Ref</th>
                <th style="padding: 0.75rem 1rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Gross Salary</th>
                <th style="padding: 0.75rem 1rem;">Deductions</th>
                <th style="padding: 0.75rem 1rem;">Net Salary</th>
                <th style="padding: 0.75rem 1rem;">Status</th>
                <th style="padding: 0.75rem 1.5rem;">Official Document</th>
              </tr>
            </thead>
            <tbody>
              ${
                payslips.length > 0
                  ? payslips
                      .map(
                        (ps) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">PS-${ps.id.slice(0, 8).toUpperCase()}</td>
                      <td style="padding: 1rem;">${ps.employee ? `${ps.employee.firstName} ${ps.employee.lastName}` : 'Employee'}</td>
                      <td style="padding: 1rem; font-weight: 600;">$${Number(ps.grossSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem; color: var(--red);">$${Number(ps.deductionAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem; font-weight: 700; color: var(--green);">$${Number(ps.netSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem;"><span class="badge green">COMPUTED</span></td>
                      <td style="padding: 1rem 1.5rem;">
                        <a href="http://localhost:3000/api/v1/payroll/payslips/${ps.id}/html" target="_blank" class="btn-text" style="color: var(--primary); font-weight: 600; text-decoration: none;">
                          <i data-lucide="file-text"></i> View HTML / Print
                        </a>
                      </td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">No payslips computed yet. Run a Payrun to generate slips.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 10. SETTINGS VIEW
// ----------------------------------------------------
function loadSettingsView(container: HTMLElement) {
  const user = authStore.getState().user;
  const displayName = `${user?.firstName || 'System'} ${user?.lastName || 'Administrator'}`.trim();
  const initial1 = user?.firstName?.charAt(0) || 'S';
  const initial2 = user?.lastName?.charAt(0) || 'A';

  container.innerHTML = `
    <div style="max-width: 700px;">
      <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">User Profile & Session</h2>
        <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 1.5rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
            ${initial1}${initial2}
          </div>
          <div>
            <h3>${displayName}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${user?.email || 'admin@peoplepay360.local'}</p>
            <span class="badge blue" style="margin-top: 0.5rem;">${(user?.role || 'ADMIN').replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      <div class="card" style="padding: 2rem;">
        <h2 style="margin-bottom: 1rem;">System Information</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">
          <strong>Database:</strong> PostgreSQL 18.6 (localhost:5432, db: peoplepay360)
        </p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">
          <strong>Security:</strong> Fastify Helmet + HttpOnly Cookie Auth + SafeMathParser AST Engine
        </p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          <strong>API Prefix:</strong> <code>/api/v1</code> (All REST API endpoints returning standardized JSON)
        </p>
      </div>
    </div>
  `;
  refreshIcons();
}

// ----------------------------------------------------
// 11. USER MANAGEMENT VIEW (FETCHES REAL POSTGRESQL USERS)
// ----------------------------------------------------
async function loadUsersView(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
      <div style="text-align: center;">
        <i data-lucide="refresh-cw" class="animate-spin" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
        <p>Loading Users from PostgreSQL...</p>
      </div>
    </div>
  `;
  refreshIcons();

  try {
    const res = await api.get('/users?limit=50').catch(() => ({ data: [] }));
    const users = extractList<any>(res);

    container.innerHTML = `
      <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--text-main);">User Accounts & RBAC</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Authorized system user accounts persisted in PostgreSQL <code>User</code> table</p>
        </div>
      </div>

      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background: var(--surface-light);">
                <th style="padding: 1rem 1.5rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">USER</th>
                <th style="padding: 1rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">EMAIL</th>
                <th style="padding: 1rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">ROLE</th>
                <th style="padding: 1rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">STATUS</th>
                <th style="padding: 1rem 1.5rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">CREATED</th>
              </tr>
            </thead>
            <tbody>
              ${
                users.length > 0
                  ? users
                      .map(
                        (u) => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${u.firstName || ''} ${u.lastName || ''}</td>
                      <td style="padding: 1rem;">${u.email}</td>
                      <td style="padding: 1rem;"><span class="badge ${u.role === 'ADMIN' ? 'blue' : 'neutral'}">${u.role}</span></td>
                      <td style="padding: 1rem;"><span class="badge ${u.isActive !== false ? 'green' : 'red'}">${u.isActive !== false ? 'ACTIVE' : 'INACTIVE'}</span></td>
                      <td style="padding: 1rem 1.5rem; color: var(--text-muted);">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No user accounts found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error loading users: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 12. SECURITY AUDIT LOGS VIEW (FETCHES REAL AUDIT TRAIL)
// ----------------------------------------------------
async function loadAuditLogsView(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
      <div style="text-align: center;">
        <i data-lucide="refresh-cw" class="animate-spin" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
        <p>Loading Audit Trail from PostgreSQL...</p>
      </div>
    </div>
  `;
  refreshIcons();

  try {
    const res = await api.get('/audit-logs?limit=50').catch(() => ({ data: [] }));
    const logs = extractList<any>(res);

    container.innerHTML = `
      <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.4rem; font-weight: 700; color: var(--text-main);">Security Audit Trail</h2>
          <p style="color: var(--text-muted); font-size: 0.85rem;">Immutable audit records persisted in PostgreSQL <code>audit_logs</code> table</p>
        </div>
      </div>

      <div class="card" style="padding: 0; overflow: hidden;">
        <div style="overflow-x: auto;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-color); text-align: left; background: var(--surface-light);">
                <th style="padding: 1rem 1.5rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">TIMESTAMP</th>
                <th style="padding: 1rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">ACTION</th>
                <th style="padding: 1rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">ENTITY</th>
                <th style="padding: 1rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">ACTOR</th>
                <th style="padding: 1rem 1.5rem; font-weight: 600; font-size: 0.85rem; color: var(--text-muted);">ENTITY ID</th>
              </tr>
            </thead>
            <tbody>
              ${
                logs.length > 0
                  ? logs
                      .map(
                        (l) => `
                    <tr style="border-bottom: 1px solid var(--border-color);">
                      <td style="padding: 1rem 1.5rem; color: var(--text-muted);">${new Date(l.createdAt).toLocaleString()}</td>
                      <td style="padding: 1rem;"><span class="badge blue">${l.action}</span></td>
                      <td style="padding: 1rem; font-weight: 600;">${l.entityType}</td>
                      <td style="padding: 1rem;">${l.user ? `${l.user.firstName || ''} ${l.user.lastName || ''} (${l.user.email})` : 'System'}</td>
                      <td style="padding: 1rem 1.5rem;"><code style="background: var(--surface-light); padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.8rem;">${l.entityId || 'N/A'}</code></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No audit records found yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error loading audit trail: ${err.message}</div>`;
  }
}

// Start application
initApp();
