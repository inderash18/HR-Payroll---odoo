import { authStore } from './state/auth';
import { api } from './api/client';
import {
  User,
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

// Current active tab
let activeTab: string = 'dashboard';

// App Initialization
async function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Listen to auth changes
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

  // Verify existing session
  await authStore.bootstrap();
}

// ----------------------------------------------------
// LOADING VIEW
// ----------------------------------------------------
function renderLoading(container: HTMLElement) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; width: 100%;">
      <div style="font-size: 1.5rem; font-weight: 700; color: #4B394A; margin-bottom: 0.5rem;">PeoplePay360</div>
      <p style="color: #64748b; font-size: 0.9rem;">Connecting to secure HR & Payroll backend...</p>
    </div>
  `;
}

// ----------------------------------------------------
// LOGIN VIEW
// ----------------------------------------------------
function renderLogin(container: HTMLElement) {
  container.innerHTML = `
    <div class="login-section">
      <div class="brand">
        <svg class="brand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <div class="brand-text">
          <h2>PeoplePay360</h2>
          <p>Enterprise HR & Payroll Platform</p>
        </div>
      </div>

      <div class="welcome-text">
        <h1>Welcome Back</h1>
        <p>Sign in with your organizational credentials.</p>
      </div>

      <div class="quick-logins">
        <h4>⚡ Quick Fill Demo Roles (PostgreSQL Database)</h4>
        <div class="quick-btn-group">
          <button class="btn-quick" id="btn-demo-admin">👑 Admin</button>
          <button class="btn-quick" id="btn-demo-payroll">💰 Payroll Mgr</button>
          <button class="btn-quick" id="btn-demo-hr">👥 HR Manager</button>
          <button class="btn-quick" id="btn-demo-emp">💼 Employee</button>
        </div>
      </div>

      <form id="login-form">
        <div class="form-group">
          <label>Work Email</label>
          <div class="input-wrapper">
            <input type="email" id="login-email" placeholder="name@peoplepay360.local" required value="admin@peoplepay360.local">
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <div class="input-wrapper">
            <input type="password" id="login-password" placeholder="••••••••" required value="Admin@123456">
          </div>
        </div>

        <div id="login-error-msg" style="color: #dc2626; font-size: 0.85rem; margin-bottom: 1rem; display: none;"></div>

        <button type="submit" class="btn-primary" id="btn-login-submit">
          Sign In
        </button>
      </form>
    </div>

    <div class="image-section">
      <div class="image-overlay-text">
        <h2>Empowering People.</h2>
        <h2 class="highlight">Simplifying Payroll.</h2>
        <p>PostgreSQL 18.6 Single Source of Truth.<br>Multi-tenant HR, Time Off & Safe Salary Rules.</p>
      </div>
    </div>
  `;

  // Demo role shortcuts
  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;

  document.getElementById('btn-demo-admin')?.addEventListener('click', () => {
    if (emailInput && passwordInput) {
      emailInput.value = 'admin@peoplepay360.local';
      passwordInput.value = 'Admin@123456';
    }
  });

  document.getElementById('btn-demo-payroll')?.addEventListener('click', () => {
    if (emailInput && passwordInput) {
      emailInput.value = 'payroll.manager@peoplepay360.local';
      passwordInput.value = 'Payroll@123456';
    }
  });

  document.getElementById('btn-demo-hr')?.addEventListener('click', () => {
    if (emailInput && passwordInput) {
      emailInput.value = 'hr.manager@peoplepay360.local';
      passwordInput.value = 'Hr@123456';
    }
  });

  document.getElementById('btn-demo-emp')?.addEventListener('click', () => {
    if (emailInput && passwordInput) {
      emailInput.value = 'employee@peoplepay360.local';
      passwordInput.value = 'Emp@123456';
    }
  });

  // Login Form Submission
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
      btn.innerText = 'Sign In';
    }
  });
}

// ----------------------------------------------------
// DASHBOARD SHELL & NAVIGATION
// ----------------------------------------------------
function renderDashboardShell(container: HTMLElement, user: User) {
  const isEmployeeOnly = user.role === 'EMPLOYEE';
  const isPayroll = user.role === 'HR_PAYROLL_MANAGER' || user.role === 'HR_PAYROLL_USER' || user.role === 'ADMIN';

  container.innerHTML = `
    <div class="app-shell">
      <aside class="app-sidebar">
        <div class="sidebar-brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <div>
            <h3>PeoplePay360</h3>
            <span>${user.organization?.name || 'Enterprise'}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Overview</div>
          <button class="nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
            📊 Dashboard
          </button>

          ${
            !isEmployeeOnly
              ? `
            <div class="nav-section-title">HR Management</div>
            <button class="nav-item ${activeTab === 'employees' ? 'active' : ''}" data-tab="employees">
              👥 Employees
            </button>
            <button class="nav-item ${activeTab === 'contracts' ? 'active' : ''}" data-tab="contracts">
              📝 Contracts
            </button>
            <button class="nav-item ${activeTab === 'schedules' ? 'active' : ''}" data-tab="schedules">
              ⏰ Working Schedules
            </button>
          `
              : ''
          }

          <div class="nav-section-title">Time & Attendance</div>
          <button class="nav-item ${activeTab === 'attendance' ? 'active' : ''}" data-tab="attendance">
            📅 Attendance Log
          </button>
          <button class="nav-item ${activeTab === 'leaves' ? 'active' : ''}" data-tab="leaves">
            🏖️ Time Off & Leaves
          </button>

          ${
            isPayroll
              ? `
            <div class="nav-section-title">Payroll Management</div>
            <button class="nav-item ${activeTab === 'structures' ? 'active' : ''}" data-tab="structures">
              ⚙️ Salary Structures
            </button>
            <button class="nav-item ${activeTab === 'payruns' ? 'active' : ''}" data-tab="payruns">
              💳 Payrun Batches
            </button>
          `
              : ''
          }

          <div class="nav-section-title">My Documents</div>
          <button class="nav-item ${activeTab === 'payslips' ? 'active' : ''}" data-tab="payslips">
            📄 Payslips & Tax
          </button>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar">${user.firstName.charAt(0)}${user.lastName.charAt(0)}</div>
            <div class="user-info">
              <div class="user-name">${user.firstName} ${user.lastName}</div>
              <div class="user-role-badge">${user.role.replace(/_/g, ' ')}</div>
            </div>
          </div>
          <button class="btn-logout" id="btn-logout" title="Sign Out">
            🚪
          </button>
        </div>
      </aside>

      <main class="app-main">
        <header class="app-header">
          <div class="page-title">
            <h2 id="header-tab-title">Dashboard Overview</h2>
          </div>
          <div class="header-actions">
            <span class="badge info">PostgreSQL 18 &bull; Single Source of Truth</span>
          </div>
        </header>

        <div class="app-content" id="tab-content">
          <!-- Content injected dynamically based on active tab -->
        </div>
      </main>
    </div>
  `;

  // Tab navigation listeners
  container.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = (btn as HTMLElement).dataset.tab;
      if (tab) {
        activeTab = tab;
        container.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        loadActiveTabContent();
      }
    });
  });

  // Logout listener
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    await authStore.logout();
    showToast('Signed out successfully', 'info');
  });

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
      if (headerTitle) headerTitle.innerText = 'Organizational KPI Dashboard';
      loadDashboardView(contentArea);
      break;
    case 'employees':
      if (headerTitle) headerTitle.innerText = 'Employee Directory';
      loadEmployeesView(contentArea);
      break;
    case 'contracts':
      if (headerTitle) headerTitle.innerText = 'Employee Contracts & Compensation';
      loadContractsView(contentArea);
      break;
    case 'schedules':
      if (headerTitle) headerTitle.innerText = 'Working Schedules & Shifts';
      loadSchedulesView(contentArea);
      break;
    case 'attendance':
      if (headerTitle) headerTitle.innerText = 'Daily Attendance Tracking';
      loadAttendanceView(contentArea);
      break;
    case 'leaves':
      if (headerTitle) headerTitle.innerText = 'Time Off Allocations & Requests';
      loadLeavesView(contentArea);
      break;
    case 'structures':
      if (headerTitle) headerTitle.innerText = 'Salary Structures & Calculation Rules';
      loadStructuresView(contentArea);
      break;
    case 'payruns':
      if (headerTitle) headerTitle.innerText = 'Payrun Batches & Payroll Execution';
      loadPayrunsView(contentArea);
      break;
    case 'payslips':
      if (headerTitle) headerTitle.innerText = 'Generated Payslip Records';
      loadPayslipsView(contentArea);
      break;
  }
}

// ----------------------------------------------------
// 1. DASHBOARD VIEW
// ----------------------------------------------------
async function loadDashboardView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading live metrics from PostgreSQL...</div>`;

  try {
    const res = await api.get<{ success: boolean; data: DashboardOverview }>('/dashboard/overview');
    const data = res.data;

    container.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-info">
            <h4>Active Employees</h4>
            <div class="kpi-value">${data.activeEmployees}</div>
          </div>
          <div class="kpi-icon-box purple">👥</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <h4>Active Contracts</h4>
            <div class="kpi-value">${data.activeContracts}</div>
          </div>
          <div class="kpi-icon-box blue">📝</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <h4>Pending Leave Requests</h4>
            <div class="kpi-value">${data.pendingLeaves}</div>
          </div>
          <div class="kpi-icon-box amber">🏖️</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-info">
            <h4>All-Time Net Paid</h4>
            <div class="kpi-value">$${data.allTimePaidNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div class="kpi-icon-box green">💰</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
        <div class="panel">
          <div class="panel-header">
            <h3>Department Headcounts</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Code</th>
                  <th style="text-align: right;">Headcount</th>
                </tr>
              </thead>
              <tbody>
                ${
                  data.departmentHeadcounts && data.departmentHeadcounts.length > 0
                    ? data.departmentHeadcounts
                        .map(
                          (d) => `
                      <tr>
                        <td><strong>${d.name}</strong></td>
                        <td><span class="badge neutral">${d.code}</span></td>
                        <td style="text-align: right; font-weight: 700;">${d.employeeCount}</td>
                      </tr>
                    `,
                        )
                        .join('')
                    : `<tr><td colspan="3" class="empty-state">No department records</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3>Latest Payrun Status</h3>
          </div>
          <div style="padding: 1.5rem;">
            ${
              data.latestPayrun
                ? `
              <h4 style="font-size: 1.1rem; margin-bottom: 0.5rem;">${data.latestPayrun.name}</h4>
              <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">
                Period: ${new Date(data.latestPayrun.startDate).toLocaleDateString()} - ${new Date(data.latestPayrun.endDate).toLocaleDateString()}
              </p>
              <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <span class="badge ${data.latestPayrun.status === 'PAID' ? 'success' : 'warning'}">${data.latestPayrun.status}</span>
                <span class="badge neutral">Gross: $${Number(data.latestPayrun.totalGross).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span class="badge success">Net: $${Number(data.latestPayrun.totalNet).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            `
                : `<div class="empty-state">No payruns processed yet.</div>`
            }
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading dashboard: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 2. EMPLOYEES VIEW
// ----------------------------------------------------
async function loadEmployeesView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Fetching employees from PostgreSQL...</div>`;

  try {
    const res = await api.get<{ items: Employee[] }>('/employees?limit=50');
    const employees = res.items || [];

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h3>Employee Directory (${employees.length})</h3>
          <div class="panel-actions">
            <button class="btn-sm btn-brand" id="btn-add-employee">➕ Add Employee</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Emp #</th>
                <th>Name</th>
                <th>Work Email</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Bank Account</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                employees.length > 0
                  ? employees
                      .map(
                        (e) => `
                    <tr>
                      <td><strong>${e.employeeNum}</strong></td>
                      <td>${e.firstName} ${e.lastName}</td>
                      <td>${e.workEmail}</td>
                      <td>${e.department?.name || '—'}</td>
                      <td>${e.jobPosition?.title || '—'}</td>
                      <td>${e.bankAccountMasked || '••••••••'}</td>
                      <td><span class="badge ${e.isActive ? 'success' : 'danger'}">${e.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="7" class="empty-state">No employees found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-employee')?.addEventListener('click', () => {
      openAddEmployeeModal();
    });
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading employees: ${err.message}</div>`;
  }
}

async function openAddEmployeeModal() {
  const deptsRes = await api.get<{ items: Department[] }>('/departments?limit=50').catch(() => ({ items: [] }));
  const schedulesRes = await api.get<WorkingSchedule[]>('/working-schedules').catch(() => []);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Employee</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-employee-form">
        <div class="modal-body">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Employee Number</label>
              <input type="text" id="emp-num" placeholder="EMP-00103" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Work Email</label>
              <input type="email" id="emp-email" placeholder="john.doe@peoplepay360.local" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>First Name</label>
              <input type="text" id="emp-first" placeholder="John" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" id="emp-last" placeholder="Doe" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Department</label>
              <select id="emp-dept" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
                <option value="">Select Department...</option>
                ${(deptsRes.items || []).map((d) => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Working Schedule</label>
              <select id="emp-schedule" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
                <option value="">Select Schedule...</option>
                ${(schedulesRes || []).map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="form-group" style="margin-top: 0.5rem;">
            <label>Bank Account (will be masked automatically)</label>
            <input type="text" id="emp-bank" placeholder="••••••••4821" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-sm btn-outline" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-sm btn-brand" id="btn-save-emp">Save Employee</button>
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

      showToast('Employee created in PostgreSQL successfully', 'success');
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
// 3. CONTRACTS VIEW
// ----------------------------------------------------
async function loadContractsView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading contracts from PostgreSQL...</div>`;

  try {
    const res = await api.get<{ items: Contract[] }>('/contracts?limit=50');
    const contracts = res.items || [];

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h3>Employee Contracts (${contracts.length})</h3>
          <div class="panel-actions">
            <button class="btn-sm btn-brand" id="btn-add-contract">➕ New Contract</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Contract Title</th>
                <th>Employee</th>
                <th>Wage</th>
                <th>Salary Structure</th>
                <th>Validity Period</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                contracts.length > 0
                  ? contracts
                      .map(
                        (c) => `
                    <tr>
                      <td><strong>${c.name}</strong></td>
                      <td>${c.employee ? `${c.employee.firstName} ${c.employee.lastName} (${c.employee.employeeNum})` : '—'}</td>
                      <td><strong>$${Number(c.wage).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> / ${c.wagePeriod}</td>
                      <td>${c.structure?.name || '—'}</td>
                      <td>${new Date(c.startDate).toLocaleDateString()} &rarr; ${c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Open-ended'}</td>
                      <td><span class="badge ${c.status === 'ACTIVE' ? 'success' : 'neutral'}">${c.status}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" class="empty-state">No contracts found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-contract')?.addEventListener('click', () => {
      openAddContractModal();
    });
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading contracts: ${err.message}</div>`;
  }
}

async function openAddContractModal() {
  const [empRes, structRes, schRes] = await Promise.all([
    api.get<{ items: Employee[] }>('/employees?limit=50').catch(() => ({ items: [] })),
    api.get<SalaryStructure[]>('/payroll/structures').catch(() => []),
    api.get<WorkingSchedule[]>('/working-schedules').catch(() => []),
  ]);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create Compensation Contract</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-contract-form">
        <div class="modal-body">
          <div class="form-group">
            <label>Contract Title</label>
            <input type="text" id="cnt-title" placeholder="Fulltime Engineering Contract" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Employee</label>
              <select id="cnt-emp" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
                <option value="">Select Employee...</option>
                ${(empRes.items || []).map((e) => `<option value="${e.id}">${e.firstName} ${e.lastName} (${e.employeeNum})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Monthly Base Wage ($)</label>
              <input type="number" id="cnt-wage" placeholder="5000" step="0.01" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Salary Structure</label>
              <select id="cnt-struct" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
                <option value="">Select Structure...</option>
                ${(structRes || []).map((s) => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Working Schedule</label>
              <select id="cnt-sch" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
                <option value="">Select Schedule...</option>
                ${(schRes || []).map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="cnt-start" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>End Date (Optional)</label>
              <input type="date" id="cnt-end" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-sm btn-outline" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-sm btn-brand" id="btn-save-cnt">Create Contract</button>
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
    saveBtn.innerText = 'Validating...';

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

      showToast('Contract registered successfully', 'success');
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
// 4. WORKING SCHEDULES VIEW
// ----------------------------------------------------
async function loadSchedulesView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading working schedules from PostgreSQL...</div>`;

  try {
    const schedules = await api.get<WorkingSchedule[]>('/working-schedules');

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h3>Working Schedules (${schedules.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Schedule Name</th>
                <th>Type</th>
                <th>Timezone</th>
                <th>Active Lines (Weekly Shift Hours)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                schedules.length > 0
                  ? schedules
                      .map(
                        (s) => `
                    <tr>
                      <td><strong>${s.name}</strong></td>
                      <td><span class="badge neutral">${s.type}</span></td>
                      <td>${s.timezone}</td>
                      <td>
                        ${
                          s.lines && s.lines.length > 0
                            ? s.lines.map((l) => `Day ${l.dayOfWeek}: ${l.startTime}-${l.endTime} (${l.breakMinutes}m break)`).join('<br>')
                            : 'Standard Mon-Fri 40 Hours'
                        }
                      </td>
                      <td><span class="badge ${s.active ? 'success' : 'danger'}">${s.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" class="empty-state">No working schedules defined.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading schedules: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 5. ATTENDANCE VIEW
// ----------------------------------------------------
async function loadAttendanceView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading attendance from PostgreSQL...</div>`;

  try {
    const res = await api.get<{ items: Attendance[] }>('/attendance?limit=50');
    const logs = res.items || [];

    container.innerHTML = `
      <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
        <button class="btn-sm btn-success" id="btn-clock-in">⚡ Clock In (Today)</button>
        <button class="btn-sm btn-outline" id="btn-clock-out">🛑 Clock Out (Today)</button>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h3>Daily Attendance Records (${logs.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Worked Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                logs.length > 0
                  ? logs
                      .map(
                        (a) => `
                    <tr>
                      <td><strong>${new Date(a.date).toLocaleDateString()}</strong></td>
                      <td>${a.employee ? `${a.employee.firstName} ${a.employee.lastName} (${a.employee.employeeNum})` : 'Self'}</td>
                      <td>${new Date(a.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>${a.checkOut ? new Date(a.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '— In Progress'}</td>
                      <td><strong>${a.workedHours ? `${Number(a.workedHours)} hrs` : '—'}</strong></td>
                      <td><span class="badge ${a.status === 'PRESENT' ? 'success' : 'warning'}">${a.status}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" class="empty-state">No attendance records found.</td></tr>`
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
        showToast('Clock-out recorded and hours computed in PostgreSQL', 'success');
        loadActiveTabContent();
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    });
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading attendance: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 6. TIME OFF & LEAVES VIEW
// ----------------------------------------------------
async function loadLeavesView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading time off and leave requests...</div>`;

  try {
    const user = authStore.getState().user;
    const isHR = user?.role === 'ADMIN' || user?.role === 'HR_MANAGER';

    const [types, allocations, requestsRes] = await Promise.all([
      api.get<LeaveType[]>('/leaves/types').catch(() => []),
      api.get<LeaveAllocation[]>('/leaves/allocations').catch(() => []),
      api.get<{ items: LeaveRequest[] }>('/leaves/requests?limit=50').catch(() => ({ items: [] })),
    ]);

    const requests = requestsRes.items || [];

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 1rem;">
          <button class="btn-sm btn-brand" id="btn-request-leave">🏖️ Request Time Off</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 1.5rem;">
        <div class="panel">
          <div class="panel-header">
            <h3>Leave Balances</h3>
          </div>
          <div style="padding: 1.25rem;">
            ${
              allocations.length > 0
                ? allocations
                    .map(
                      (al) => `
                  <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; margin-bottom: 0.75rem;">
                    <div style="font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">${al.leaveType?.name || 'Annual Leave'}</div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-muted);">
                      <span>Allocated: ${Number(al.allocatedAmount)}d</span>
                      <span>Consumed: ${Number(al.consumedAmount)}d</span>
                      <span style="font-weight: 700; color: var(--success-color);">Remaining: ${Number(al.allocatedAmount) - Number(al.consumedAmount)}d</span>
                    </div>
                  </div>
                `,
                    )
                    .join('')
                : `<div class="empty-state">No allocation records.</div>`
            }
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">
            <h3>Time Off Requests (${requests.length})</h3>
          </div>
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  ${isHR ? `<th>Actions</th>` : ''}
                </tr>
              </thead>
              <tbody>
                ${
                  requests.length > 0
                    ? requests
                        .map(
                          (r) => `
                      <tr>
                        <td><strong>${r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Self'}</strong></td>
                        <td>${r.leaveType?.name || 'Vacation'}</td>
                        <td>${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}</td>
                        <td><strong>${Number(r.numberOfDays)} days</strong></td>
                        <td><span class="badge ${r.status === 'APPROVED' ? 'success' : r.status === 'PENDING_APPROVAL' ? 'warning' : 'danger'}">${r.status.replace(/_/g, ' ')}</span></td>
                        ${
                          isHR
                            ? `
                          <td>
                            ${
                              r.status === 'PENDING_APPROVAL'
                                ? `
                              <button class="btn-sm btn-success btn-approve-leave" data-id="${r.id}">Approve</button>
                              <button class="btn-sm btn-danger btn-reject-leave" data-id="${r.id}">Reject</button>
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
                    : `<tr><td colspan="${isHR ? 6 : 5}" class="empty-state">No leave requests found.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-request-leave')?.addEventListener('click', () => {
      openRequestLeaveModal(types);
    });

    if (isHR) {
      container.querySelectorAll('.btn-approve-leave').forEach((b) => {
        b.addEventListener('click', async () => {
          const id = (b as HTMLElement).dataset.id;
          try {
            await api.post(`/leaves/requests/${id}/approve`);
            showToast('Leave approved and balance deducted in PostgreSQL transaction', 'success');
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
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading leave data: ${err.message}</div>`;
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
        <div class="modal-body">
          <div class="form-group">
            <label>Leave Type</label>
            <select id="leave-type-select" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
              ${types.map((t) => `<option value="${t.id}">${t.name} (${t.isPaid ? 'Paid' : 'Unpaid'})</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="leave-start" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" id="leave-end" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
          </div>
          <div class="form-group">
            <label>Number of Days</label>
            <input type="number" id="leave-days" placeholder="2" step="0.5" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
          </div>
          <div class="form-group">
            <label>Reason (Optional)</label>
            <textarea id="leave-reason" placeholder="Personal vacation..." rows="2" style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-sm btn-outline" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-sm btn-brand" id="btn-submit-leave">Submit Request</button>
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
// 7. SALARY STRUCTURES VIEW
// ----------------------------------------------------
async function loadStructuresView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading salary structures from PostgreSQL...</div>`;

  try {
    const structures = await api.get<SalaryStructure[]>('/payroll/structures');

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h3>Configured Salary Structures (${structures.length})</h3>
        </div>
        <div style="padding: 1.5rem;">
          ${
            structures.length > 0
              ? structures
                  .map(
                    (st) => `
                <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.5rem;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <div>
                      <h4 style="font-size: 1.15rem; font-weight: 700;">${st.name}</h4>
                      <span class="badge neutral" style="margin-top: 0.25rem;">Code: ${st.code}</span>
                    </div>
                    <span class="badge ${st.active ? 'success' : 'danger'}">${st.active ? 'ACTIVE' : 'INACTIVE'}</span>
                  </div>

                  <h5 style="font-size: 0.85rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.5rem;">Ordered Salary Rules (Evaluated via Safe AST Parser)</h5>
                  <table class="data-table" style="background: white; border-radius: 0.5rem; border: 1px solid var(--border-color);">
                    <thead>
                      <tr>
                        <th>Seq</th>
                        <th>Rule Name</th>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Calculation Method</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${
                        st.rules && st.rules.length > 0
                          ? st.rules
                              .map(
                                (r) => `
                            <tr>
                              <td><strong>${r.sequence}</strong></td>
                              <td>${r.name}</td>
                              <td><span class="badge neutral">${r.code}</span></td>
                              <td><span class="badge info">${r.category}</span></td>
                              <td>
                                ${
                                  r.amountType === 'PERCENTAGE'
                                    ? `${r.amountPercentage}% of ${r.percentageBasedOn || 'Base'}`
                                    : r.amountType === 'FIXED'
                                      ? `$${Number(r.amountFixed || 0).toLocaleString()} (Fixed)`
                                      : `<code>${r.codeFormula}</code>`
                                }
                              </td>
                            </tr>
                          `,
                              )
                              .join('')
                          : `<tr><td colspan="5" class="empty-state">No salary rules configured.</td></tr>`
                      }
                    </tbody>
                  </table>
                </div>
              `,
                  )
                  .join('')
              : `<div class="empty-state">No salary structures configured.</div>`
          }
        </div>
      </div>
    `;
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading salary structures: ${err.message}</div>`;
  }
}

// ----------------------------------------------------
// 8. PAYRUN MANAGEMENT VIEW
// ----------------------------------------------------
async function loadPayrunsView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading payrun batches from PostgreSQL...</div>`;

  try {
    const res = await api.get<{ items: Payrun[] }>('/payroll/payruns?limit=50');
    const payruns = res.items || [];

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h3>Payrun Batches (${payruns.length})</h3>
          <div class="panel-actions">
            <button class="btn-sm btn-brand" id="btn-create-payrun">➕ New Payrun Batch</button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Payrun Name</th>
                <th>Period</th>
                <th>Payslips</th>
                <th>Total Gross</th>
                <th>Total Net</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${
                payruns.length > 0
                  ? payruns
                      .map(
                        (p) => `
                    <tr>
                      <td><strong>${p.name}</strong></td>
                      <td>${new Date(p.startDate).toLocaleDateString()} &rarr; ${new Date(p.endDate).toLocaleDateString()}</td>
                      <td><strong>${p._count?.payslips || 0}</strong></td>
                      <td>$${Number(p.totalGross).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td><strong>$${Number(p.totalNet).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td><span class="badge ${p.status === 'PAID' ? 'success' : p.status === 'VALIDATED' ? 'info' : 'warning'}">${p.status}</span></td>
                      <td>
                        ${
                          p.status === 'DRAFT' || p.status === 'COMPUTING'
                            ? `<button class="btn-sm btn-brand btn-compute-payrun" data-id="${p.id}">Compute</button>`
                            : p.status === 'COMPUTED'
                              ? `
                              <button class="btn-sm btn-success btn-validate-payrun" data-id="${p.id}">Validate</button>
                              <button class="btn-sm btn-outline btn-compute-payrun" data-id="${p.id}">Recompute</button>
                            `
                              : p.status === 'VALIDATED'
                                ? `
                              <button class="btn-sm btn-success btn-pay-payrun" data-id="${p.id}">Mark Paid</button>
                              <button class="btn-sm btn-outline btn-send-payslips" data-id="${p.id}">Email Payslips</button>
                            `
                                : `<button class="btn-sm btn-outline btn-send-payslips" data-id="${p.id}">Email Payslips</button>`
                        }
                      </td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="7" class="empty-state">No payruns created yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-create-payrun')?.addEventListener('click', () => {
      openCreatePayrunModal();
    });

    container.querySelectorAll('.btn-compute-payrun').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = (b as HTMLElement).dataset.id;
        try {
          (b as HTMLButtonElement).disabled = true;
          (b as HTMLButtonElement).innerText = 'Computing...';
          await api.post(`/payroll/payruns/${id}/compute`);
          showToast('Salary rules executed and payslips computed in PostgreSQL', 'success');
          loadActiveTabContent();
        } catch (err: any) {
          showToast(err.message, 'error');
          (b as HTMLButtonElement).disabled = false;
        }
      });
    });

    container.querySelectorAll('.btn-validate-payrun').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/validate`);
          showToast('Payrun validated and payslip totals locked', 'success');
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
          await api.post(`/payroll/payruns/${id}/pay`);
          showToast('Payrun marked as PAID. Outbox event queued.', 'success');
          loadActiveTabContent();
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.btn-send-payslips').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/send-payslips`);
          showToast('Payslip email deliveries queued in outbox for asynchronous dispatch', 'success');
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading payruns: ${err.message}</div>`;
  }
}

function openCreatePayrunModal() {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Payrun Batch</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="create-payrun-form">
        <div class="modal-body">
          <div class="form-group">
            <label>Payrun Batch Name</label>
            <input type="text" id="pr-name" placeholder="September 2026 Monthly Payroll" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Period Start Date</label>
              <input type="date" id="pr-start" value="2026-09-01" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Period End Date</label>
              <input type="date" id="pr-end" value="2026-09-30" required style="width: 100%; padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 0.5rem;">
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-sm btn-outline" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-sm btn-brand" id="btn-save-pr">Create Payrun</button>
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
    btn.innerText = 'Creating...';

    try {
      await api.post('/payroll/payruns', {
        name: (modalBackdrop.querySelector('#pr-name') as HTMLInputElement).value,
        startDate: (modalBackdrop.querySelector('#pr-start') as HTMLInputElement).value,
        endDate: (modalBackdrop.querySelector('#pr-end') as HTMLInputElement).value,
      });

      showToast('Payrun batch created in DRAFT state', 'success');
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
// 9. PAYSLIPS & OFFICIAL DOCUMENT VIEW
// ----------------------------------------------------
async function loadPayslipsView(container: HTMLElement) {
  container.innerHTML = `<div class="empty-state">Loading payslips from PostgreSQL...</div>`;

  try {
    const payslips = await api.get<Payslip[]>('/payroll/payslips');

    container.innerHTML = `
      <div class="panel">
        <div class="panel-header">
          <h3>Official Payslips (${payslips.length})</h3>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Pay Period</th>
                <th>Worked Days</th>
                <th>Gross Salary</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Official Document</th>
              </tr>
            </thead>
            <tbody>
              ${
                payslips.length > 0
                  ? payslips
                      .map(
                        (p) => `
                    <tr>
                      <td><strong>${p.employee?.firstName} ${p.employee?.lastName} (${p.employee?.employeeNum})</strong></td>
                      <td>${new Date(p.periodStart).toLocaleDateString()} - ${new Date(p.periodEnd).toLocaleDateString()}</td>
                      <td>${p.workedDays} days</td>
                      <td>$${Number(p.grossSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td>$${Number(p.deductionAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td><strong style="color: var(--success-color);">$${Number(p.netSalary).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></td>
                      <td>
                        <button class="btn-sm btn-outline btn-view-payslip-doc" data-id="${p.id}">📄 View & Print</button>
                      </td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="7" class="empty-state">No payslips calculated yet. Compute a payrun to generate payslips.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.btn-view-payslip-doc').forEach((b) => {
      b.addEventListener('click', async () => {
        const id = (b as HTMLElement).dataset.id;
        if (id) openPayslipDocumentModal(id);
      });
    });
  } catch (err: any) {
    container.innerHTML = `<div class="empty-state" style="color: #dc2626;">Error loading payslips: ${err.message}</div>`;
  }
}

async function openPayslipDocumentModal(payslipId: string) {
  try {
    const res = await api.get<{ success: boolean; html: string }>(`/payroll/payslips/${payslipId}/html`);
    const html = res.html;

    const modalBackdrop = document.createElement('div');
    modalBackdrop.className = 'modal-backdrop';
    modalBackdrop.innerHTML = `
      <div class="modal-card" style="max-width: 850px; height: 90vh;">
        <div class="modal-header">
          <h3>Payslip Document Preview</h3>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <button class="btn-sm btn-brand" id="btn-print-frame">🖨️ Print Document</button>
            <button class="btn-close" id="modal-close">&times;</button>
          </div>
        </div>
        <div class="modal-body" style="flex: 1; padding: 0; overflow: hidden;">
          <iframe id="payslip-iframe" style="width: 100%; height: 100%; border: none;"></iframe>
        </div>
      </div>
    `;

    document.body.appendChild(modalBackdrop);

    const iframe = modalBackdrop.querySelector('#payslip-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.document.open();
      iframe.contentWindow.document.write(html);
      iframe.contentWindow.document.close();
    }

    const close = () => modalBackdrop.remove();
    modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
    modalBackdrop.querySelector('#btn-print-frame')?.addEventListener('click', () => {
      iframe.contentWindow?.print();
    });
  } catch (err: any) {
    showToast(`Error retrieving document: ${err.message}`, 'error');
  }
}

// Start application
initApp();
