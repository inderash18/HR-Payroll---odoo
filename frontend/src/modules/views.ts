import { adminDataStore, UserItem } from './mockData';

// Toast helper callback
let toastFn: (msg: string, type?: 'success' | 'error' | 'info') => void = () => {};
export function setAdminToastHandler(fn: (msg: string, type?: 'success' | 'error' | 'info') => void) {
  toastFn = fn;
}

// ============================================================================
// 1. DASHBOARD VIEW (MATCHES USER IMAGE EXACTLY)
// ============================================================================
export function renderAdminDashboard(container: HTMLElement) {
  const users = adminDataStore.users;
  const employees = adminDataStore.employees;
  const departments = adminDataStore.departments;

  container.innerHTML = `
    <div class="ref-dashboard-wrapper">
      <!-- MAIN TOP ROW: HERO CARDS -->
      <div class="ref-top-row">
        
        <!-- LEFT: UNIVERSAL CARD HERO WIDGET -->
        <div class="ref-hero-card">
          <div class="ref-hero-card-header">
            <div class="ref-card-tabs">
              <button class="ref-tab-btn active" data-subtab="universal">Universal card</button>
              <button class="ref-tab-btn" data-subtab="silver">Silver</button>
              <button class="ref-tab-btn" data-subtab="platinum">Platinum</button>
            </div>
            <button class="ref-dots-btn" title="Options">•••</button>
          </div>

          <div class="ref-hero-card-body">
            <!-- PHYSICAL SMART DEBIT CARD -->
            <div class="ref-smart-card">
              <div class="ref-card-top">
                <div class="ref-emv-chip">
                  <div class="ref-chip-line"></div>
                  <div class="ref-chip-line"></div>
                </div>
                <!-- SUNBURST ACCENT -->
                <div class="ref-sunburst"></div>
              </div>

              <div class="ref-card-number">5986 4855 7856 4959</div>

              <div class="ref-card-bottom">
                <span class="ref-card-holder">Jerome Bell</span>
                <div class="ref-mastercard-circles">
                  <div class="circle red"></div>
                  <div class="circle orange"></div>
                </div>
              </div>
            </div>

            <!-- RIGHT METRICS & HAND-DRAWN OVAL -->
            <div class="ref-metrics-column">
              <div class="ref-circled-amount-box">
                <div class="ref-amount-val">$102,456</div>
                <!-- Hand-drawn style SVG loop circle -->
                <svg class="ref-handdrawn-oval" viewBox="0 0 140 50" fill="none">
                  <path d="M12,24 C14,8 70,3 120,10 C138,13 138,36 100,43 C50,51 5,42 16,22 C22,14 65,8 105,12" 
                        stroke="#111c24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                </svg>
              </div>

              <div class="ref-comparison-table">
                <div class="ref-table-head">
                  <span></span>
                  <span>July</span>
                  <span>August</span>
                </div>
                <div class="ref-table-row">
                  <span class="label">Available</span>
                  <span class="val bold">$31,213</span>
                  <span class="val bold">$82,456</span>
                </div>
                <div class="ref-table-row">
                  <span class="label">Credit limit</span>
                  <span class="val bold">$12,000</span>
                  <span class="val bold">$20,000</span>
                </div>
                <div class="ref-table-row">
                  <span class="label">Credit used</span>
                  <span class="val bold">$10,000</span>
                  <span class="val bold">$0,00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: MINI METRICS (INCOME & EXPENSES) -->
        <div class="ref-mini-cards-column">
          <!-- INCOME CARD -->
          <div class="ref-mini-metric-card">
            <div class="ref-icon-circle income-circle">
              <i data-lucide="arrow-down-left"></i>
            </div>
            <div class="ref-metric-text">
              <span class="ref-metric-label">Income</span>
              <span class="ref-metric-val">$62,456</span>
            </div>
            <div class="ref-mini-dots-wrapper">
              <button class="ref-dots-btn" id="btn-income-menu">•••</button>
              <div class="ref-dropdown-popup" id="income-dropdown">
                <div class="dropdown-item">View details</div>
                <div class="dropdown-item">Share</div>
                <div class="dropdown-item">Download</div>
              </div>
            </div>
          </div>

          <!-- EXPENSES CARD -->
          <div class="ref-mini-metric-card">
            <div class="ref-icon-circle expense-circle">
              <i data-lucide="arrow-up-right"></i>
            </div>
            <div class="ref-metric-text">
              <span class="ref-metric-label">Expenses</span>
              <span class="ref-metric-val">$24,456</span>
            </div>
            <button class="ref-dots-btn">•••</button>
          </div>
        </div>
      </div>

      <!-- MAIN BOTTOM ROW: TRANSACTIONS & MONEY FLOW -->
      <div class="ref-bottom-row">
        
        <!-- LEFT: LAST TRANSACTIONS TABLE -->
        <div class="ref-transactions-card">
          <div class="ref-card-header-line">
            <h3 class="ref-section-title">Last Transactions</h3>
            <a href="#" class="ref-view-all-link" id="btn-view-all-tx">View all &rarr;</a>
          </div>

          <div class="ref-table-wrapper">
            <table class="ref-transactions-table">
              <thead>
                <tr>
                  <th>Name of transactions</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="ref-tx-name">
                      <div class="ref-tx-icon"><i data-lucide="building-2"></i></div>
                      <span>Rent an apartment</span>
                    </div>
                  </td>
                  <td class="ref-tx-date">Aug 18,2022 at 5:16 PM</td>
                  <td class="ref-tx-amount bold">- $1,200</td>
                  <td><span class="ref-status-pill paid">Paid</span></td>
                </tr>

                <tr>
                  <td>
                    <div class="ref-tx-name">
                      <div class="ref-tx-icon"><i data-lucide="briefcase"></i></div>
                      <span>Hotel Hilton</span>
                    </div>
                  </td>
                  <td class="ref-tx-date">Aug 16,2022 at 10:00 AM</td>
                  <td class="ref-tx-amount bold">- $1,500</td>
                  <td><span class="ref-status-pill decline">Decline</span></td>
                </tr>

                <tr>
                  <td>
                    <div class="ref-tx-name">
                      <div class="ref-tx-icon"><i data-lucide="calendar-range"></i></div>
                      <span>Booking</span>
                    </div>
                  </td>
                  <td class="ref-tx-date">Aug 10,2022 at 3:16 PM</td>
                  <td class="ref-tx-amount bold">- $1,030</td>
                  <td><span class="ref-status-pill paid">Paid</span></td>
                </tr>

                <tr>
                  <td>
                    <div class="ref-tx-name">
                      <div class="ref-tx-icon"><i data-lucide="coffee"></i></div>
                      <span>Coffee point</span>
                    </div>
                  </td>
                  <td class="ref-tx-date">Aug 6,2022 at 9:02 AM</td>
                  <td class="ref-tx-amount bold">- $3,40</td>
                  <td><span class="ref-status-pill in-progress">In progress</span></td>
                </tr>

                <tr>
                  <td>
                    <div class="ref-tx-name">
                      <div class="ref-tx-icon"><i data-lucide="bed"></i></div>
                      <span>Rainbow Room</span>
                    </div>
                  </td>
                  <td class="ref-tx-date">Aug 4,2022 at 2:00 PM</td>
                  <td class="ref-tx-amount bold">- $12,400</td>
                  <td><span class="ref-status-pill paid">Paid</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- RIGHT: MONEY FLOW PIE / DONUT -->
        <div class="ref-money-flow-card">
          <div class="ref-card-header-line">
            <h3 class="ref-section-title">Money flow</h3>
            <div class="ref-card-header-controls">
              <button class="ref-filter-pill">Aug ▾</button>
              <button class="ref-dots-btn">•••</button>
            </div>
          </div>

          <div class="ref-chart-container">
            <!-- DONUT SVG WITH 82% AND 18% SLICES -->
            <div class="ref-donut-wrapper">
              <svg viewBox="0 0 200 200" class="ref-donut-svg">
                <defs>
                  <!-- Striped pattern for the 82% textured dark slice -->
                  <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#253545" stroke-width="2" />
                  </pattern>
                </defs>
                <!-- 82% Textured Dark Navy Slice -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#162330" stroke-width="32" 
                        stroke-dasharray="360 80" stroke-dashoffset="50" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="url(#diagonalHatch)" stroke-width="31" 
                        stroke-dasharray="360 80" stroke-dashoffset="50" />
                <!-- 18% Peach Outline Slice -->
                <circle cx="100" cy="100" r="70" fill="none" stroke="#fce4de" stroke-width="32" 
                        stroke-dasharray="78 362" stroke-dashoffset="-312" />
                <circle cx="100" cy="100" r="70" fill="none" stroke="#e05344" stroke-width="2.5" 
                        stroke-dasharray="78 362" stroke-dashoffset="-312" />
              </svg>

              <!-- Callout Arrows and Labels -->
              <div class="ref-chart-callout callout-18">
                <span class="ref-pct-num">18%</span>
                <i data-lucide="arrow-up-right"></i>
              </div>
              <div class="ref-chart-callout callout-82">
                <i data-lucide="arrow-down-left"></i>
                <span class="ref-pct-num">82%</span>
              </div>
            </div>

            <!-- Legend -->
            <div class="ref-chart-legend">
              <div class="legend-item">
                <span class="dot dark"></span>
                <span>Income</span>
              </div>
              <div class="legend-item">
                <span class="dot peach"></span>
                <span>Expenses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION: ADMIN PROJECT MODULES QUICK OVERVIEW -->
      <div class="admin-modules-kpi-band">
        <div class="admin-kpi-item" data-tab="employees">
          <div class="kpi-icon-wrap"><i data-lucide="users"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Total Employees</span>
            <span class="kpi-val">${employees.length} Active</span>
          </div>
        </div>

        <div class="admin-kpi-item" data-tab="users">
          <div class="kpi-icon-wrap"><i data-lucide="user-check"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Active Users</span>
            <span class="kpi-val">${users.filter(u => u.status === 'ACTIVE').length} / ${users.length}</span>
          </div>
        </div>

        <div class="admin-kpi-item" data-tab="organization">
          <div class="kpi-icon-wrap"><i data-lucide="building"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Departments</span>
            <span class="kpi-val">${departments.length} Units</span>
          </div>
        </div>

        <div class="admin-kpi-item" data-tab="payroll">
          <div class="kpi-icon-wrap"><i data-lucide="landmark"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Payroll Overview</span>
            <span class="kpi-val">$62,456 Disbursed</span>
          </div>
        </div>

        <div class="admin-kpi-item" data-tab="attendance">
          <div class="kpi-icon-wrap"><i data-lucide="clock"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Attendance Overview</span>
            <span class="kpi-val">94% Daily Rate</span>
          </div>
        </div>

        <div class="admin-kpi-item" data-tab="leaves">
          <div class="kpi-icon-wrap"><i data-lucide="calendar-check"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">Leave Overview</span>
            <span class="kpi-val">3 Pending Review</span>
          </div>
        </div>

        <div class="admin-kpi-item alert" data-tab="audit">
          <div class="kpi-icon-wrap alert-wrap"><i data-lucide="alert-triangle"></i></div>
          <div class="kpi-info">
            <span class="kpi-label">System Alerts</span>
            <span class="kpi-val alert-val">5 Require Action</span>
          </div>
        </div>
      </div>

    </div>
  `;

  // Attach interactive dropdown listener for 3 dots
  const incomeDots = container.querySelector('#btn-income-menu');
  const incomeDropdown = container.querySelector('#income-dropdown');
  incomeDots?.addEventListener('click', (e) => {
    e.stopPropagation();
    incomeDropdown?.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    incomeDropdown?.classList.remove('show');
  });

  // KPI clicks route to respective tabs
  container.querySelectorAll('.admin-kpi-item').forEach(el => {
    el.addEventListener('click', () => {
      const tab = (el as HTMLElement).dataset.tab;
      if (tab) {
        window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab } }));
      }
    });
  });
}

// ============================================================================
// 2. USER MANAGEMENT MODULE
// ============================================================================
export function renderUserManagementView(container: HTMLElement) {
  const users = adminDataStore.users;

  container.innerHTML = `
    <div class="admin-module-page">
      <!-- SUBNAV HEADER -->
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">User List (${users.length})</button>
          <button class="subnav-tab" id="btn-open-create-user"><i data-lucide="user-plus"></i> Create User</button>
          <button class="subnav-tab" id="btn-link-employees"><i data-lucide="link"></i> Employee ↔ User Linking</button>
        </div>
        <div class="subnav-actions">
          <input type="text" id="user-search-input" class="admin-search-input" placeholder="Search by name, email or role...">
          <button class="btn-primary-minimal" id="btn-create-user-modal"><i data-lucide="plus"></i> Add User</button>
        </div>
      </div>

      <!-- MAIN USERS TABLE -->
      <div class="admin-card-table">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>MFA</th>
              <th>Last Login</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="user-table-body">
            ${users.map(u => `
              <tr data-user-id="${u.id}">
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-initials">${u.name.split(' ').map(n=>n[0]).join('')}</div>
                    <div class="user-cell-meta">
                      <strong>${u.name}</strong>
                      <span class="user-sub">${u.employeeId ? `Linked: ${u.employeeId}` : 'No employee link'}</span>
                    </div>
                  </div>
                </td>
                <td class="text-mono">${u.email}</td>
                <td><span class="role-badge role-${u.role.toLowerCase()}">${u.role.replace(/_/g, ' ')}</span></td>
                <td>${u.department}</td>
                <td>
                  <button class="status-toggle-pill ${u.status.toLowerCase()}" data-action="toggle-status" data-id="${u.id}" title="Click to toggle status">
                    ${u.status}
                  </button>
                </td>
                <td>
                  <span class="mfa-indicator ${u.mfaEnabled ? 'enabled' : 'disabled'}">
                    ${u.mfaEnabled ? '✓ Active' : 'Off'}
                  </span>
                </td>
                <td class="text-muted text-sm">${u.lastLogin}</td>
                <td style="text-align: right;">
                  <div class="table-action-group">
                    <button class="action-icon-btn" data-action="edit" data-id="${u.id}" title="Edit User"><i data-lucide="edit-3"></i></button>
                    <button class="action-icon-btn" data-action="reset-pw" data-id="${u.id}" title="Reset Password"><i data-lucide="key"></i></button>
                    <button class="action-icon-btn danger" data-action="delete" data-id="${u.id}" title="Delete User"><i data-lucide="trash-2"></i></button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- CREATE / EDIT USER MODAL -->
      <div class="admin-modal-overlay" id="user-modal">
        <div class="admin-modal-card">
          <div class="admin-modal-header">
            <h3 id="user-modal-title">Create New System User</h3>
            <button class="admin-modal-close" id="btn-close-user-modal">&times;</button>
          </div>
          <form id="form-user-save">
            <div class="admin-modal-body">
              <input type="hidden" id="modal-user-id" value="">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Full Name *</label>
                  <input type="text" id="modal-user-name" required placeholder="e.g. Jordan Hayes">
                </div>
                <div class="form-group flex-1">
                  <label>Email Address *</label>
                  <input type="email" id="modal-user-email" required placeholder="jordan@peoplepay360.local">
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Security Role *</label>
                  <select id="modal-user-role" required>
                    <option value="ADMIN">ADMIN</option>
                    <option value="HR_MANAGER">HR MANAGER</option>
                    <option value="HR_PAYROLL_MANAGER">HR PAYROLL MANAGER</option>
                    <option value="HR_PAYROLL_USER">HR PAYROLL USER</option>
                    <option value="EMPLOYEE">EMPLOYEE</option>
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Department</label>
                  <select id="modal-user-dept">
                    ${adminDataStore.departments.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Link to Employee Profile</label>
                  <select id="modal-user-employee">
                    <option value="">-- No Link (Standalone Admin) --</option>
                    ${adminDataStore.employees.map(e => `<option value="${e.code}">${e.code} — ${e.firstName} ${e.lastName}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group flex-1">
                  <label>Account Status</label>
                  <select id="modal-user-status">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="admin-modal-footer">
              <button type="button" class="btn-cancel" id="btn-cancel-user-modal">Cancel</button>
              <button type="submit" class="btn-primary-minimal">Save User</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  // Search filtering
  const searchInput = container.querySelector('#user-search-input') as HTMLInputElement;
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    container.querySelectorAll('#user-table-body tr').forEach((row) => {
      const text = row.textContent?.toLowerCase() || '';
      (row as HTMLElement).style.display = text.includes(q) ? '' : 'none';
    });
  });

  // Modal logic
  const modal = container.querySelector('#user-modal') as HTMLElement;
  const openBtn = container.querySelector('#btn-create-user-modal');
  const openSubnavBtn = container.querySelector('#btn-open-create-user');
  const closeBtn = container.querySelector('#btn-close-user-modal');
  const cancelBtn = container.querySelector('#btn-cancel-user-modal');

  const openModal = (user?: UserItem) => {
    const title = container.querySelector('#user-modal-title') as HTMLElement;
    const idInput = container.querySelector('#modal-user-id') as HTMLInputElement;
    const nameInput = container.querySelector('#modal-user-name') as HTMLInputElement;
    const emailInput = container.querySelector('#modal-user-email') as HTMLInputElement;
    const roleInput = container.querySelector('#modal-user-role') as HTMLSelectElement;
    const deptInput = container.querySelector('#modal-user-dept') as HTMLSelectElement;
    const empInput = container.querySelector('#modal-user-employee') as HTMLSelectElement;
    const statusInput = container.querySelector('#modal-user-status') as HTMLSelectElement;

    if (user) {
      title.innerText = 'Edit System User';
      idInput.value = user.id;
      nameInput.value = user.name;
      emailInput.value = user.email;
      roleInput.value = user.role;
      deptInput.value = user.department;
      empInput.value = user.employeeId || '';
      statusInput.value = user.status;
    } else {
      title.innerText = 'Create New System User';
      idInput.value = '';
      nameInput.value = '';
      emailInput.value = '';
      roleInput.value = 'EMPLOYEE';
      statusInput.value = 'ACTIVE';
    }
    modal.classList.add('show');
  };

  openBtn?.addEventListener('click', () => openModal());
  openSubnavBtn?.addEventListener('click', () => openModal());
  closeBtn?.addEventListener('click', () => modal.classList.remove('show'));
  cancelBtn?.addEventListener('click', () => modal.classList.remove('show'));

  // Form Submit
  const form = container.querySelector('#form-user-save') as HTMLFormElement;
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const idInput = container.querySelector('#modal-user-id') as HTMLInputElement;
    const nameInput = container.querySelector('#modal-user-name') as HTMLInputElement;
    const emailInput = container.querySelector('#modal-user-email') as HTMLInputElement;
    const roleInput = container.querySelector('#modal-user-role') as HTMLSelectElement;
    const deptInput = container.querySelector('#modal-user-dept') as HTMLSelectElement;
    const empInput = container.querySelector('#modal-user-employee') as HTMLSelectElement;
    const statusInput = container.querySelector('#modal-user-status') as HTMLSelectElement;

    if (idInput.value) {
      // Edit
      const u = adminDataStore.users.find(x => x.id === idInput.value);
      if (u) {
        u.name = nameInput.value;
        u.email = emailInput.value;
        u.role = roleInput.value as any;
        u.department = deptInput.value;
        u.employeeId = empInput.value || null;
        u.status = statusInput.value as any;
        toastFn(`User ${u.name} updated successfully`, 'success');
      }
    } else {
      // Create
      const newUser: UserItem = {
        id: `usr-${Date.now()}`,
        name: nameInput.value,
        email: emailInput.value,
        role: roleInput.value as any,
        department: deptInput.value,
        employeeId: empInput.value || null,
        status: statusInput.value as any,
        mfaEnabled: false,
        lastLogin: 'Never',
      };
      adminDataStore.users.unshift(newUser);
      toastFn(`Created user account for ${newUser.name}`, 'success');
    }

    modal.classList.remove('show');
    renderUserManagementView(container);
  });

  // Table action buttons (Edit, Reset PW, Toggle Status, Delete)
  container.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement;
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    const user = adminDataStore.users.find(u => u.id === id);

    if (action === 'toggle-status' && user) {
      user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      toastFn(`User ${user.name} is now ${user.status}`, 'info');
      renderUserManagementView(container);
    } else if (action === 'edit' && user) {
      openModal(user);
    } else if (action === 'reset-pw' && user) {
      toastFn(`Password reset link generated and dispatched to ${user.email}`, 'success');
    } else if (action === 'delete' && user) {
      if (confirm(`Are you sure you want to deactivate and remove ${user.name}?`)) {
        adminDataStore.users = adminDataStore.users.filter(u => u.id !== id);
        toastFn(`User ${user.name} removed`, 'info');
        renderUserManagementView(container);
      }
    }
  });
}

// ============================================================================
// 3. ROLES & PERMISSIONS MODULE
// ============================================================================
export function renderRolesPermissionsView(container: HTMLElement) {
  const roles = adminDataStore.roles;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">Module Permissions Matrix</button>
          <button class="subnav-tab">Role Definitions (${roles.length})</button>
          <button class="subnav-tab">Role-based Module Visibility</button>
        </div>
        <div class="subnav-actions">
          <button class="btn-primary-minimal" id="btn-save-permissions"><i data-lucide="check"></i> Save Changes</button>
        </div>
      </div>

      <!-- ROLES SUMMARY CARDS -->
      <div class="roles-cards-grid">
        ${roles.map(r => `
          <div class="role-summary-card">
            <div class="role-card-top">
              <span class="role-badge role-${r.id.replace('role-','')}">${r.name}</span>
              <span class="users-pill">${r.usersCount} Assigned</span>
            </div>
            <p class="role-desc">${r.description}</p>
          </div>
        `).join('')}
      </div>

      <!-- PERMISSIONS MATRIX -->
      <div class="admin-card-table" style="margin-top: 1.5rem;">
        <div class="table-card-title">
          <h4>Granular Module CRUD Permissions</h4>
          <span class="text-muted text-sm">Configure View / Create / Edit / Delete access rights per security role</span>
        </div>
        <table class="admin-data-table matrix-table">
          <thead>
            <tr>
              <th>System Module</th>
              <th>Admin</th>
              <th>HR Payroll Manager</th>
              <th>HR Manager</th>
              <th>Standard Employee</th>
            </tr>
          </thead>
          <tbody>
            ${[
              { name: 'Dashboard Overview', code: 'dashboard' },
              { name: 'User Management', code: 'users' },
              { name: 'Roles & Permissions', code: 'roles' },
              { name: 'Organization Structure', code: 'organization' },
              { name: 'Employees Directory', code: 'employees' },
              { name: 'Payroll & Batches', code: 'payroll' },
              { name: 'Audit & System Settings', code: 'settings' },
            ].map(mod => `
              <tr>
                <td><strong>${mod.name}</strong></td>
                <td>
                  <div class="perm-checkboxes">
                    <label><input type="checkbox" checked disabled> View</label>
                    <label><input type="checkbox" checked disabled> Create</label>
                    <label><input type="checkbox" checked disabled> Edit</label>
                    <label><input type="checkbox" checked disabled> Del</label>
                  </div>
                </td>
                <td>
                  <div class="perm-checkboxes">
                    <label><input type="checkbox" checked> View</label>
                    <label><input type="checkbox" ${mod.code === 'payroll' || mod.code === 'employees' ? 'checked' : ''}> Create</label>
                    <label><input type="checkbox" ${mod.code === 'payroll' || mod.code === 'employees' ? 'checked' : ''}> Edit</label>
                    <label><input type="checkbox" ${mod.code === 'payroll' ? 'checked' : ''}> Del</label>
                  </div>
                </td>
                <td>
                  <div class="perm-checkboxes">
                    <label><input type="checkbox" checked> View</label>
                    <label><input type="checkbox" ${mod.code === 'employees' || mod.code === 'organization' ? 'checked' : ''}> Create</label>
                    <label><input type="checkbox" ${mod.code === 'employees' || mod.code === 'organization' ? 'checked' : ''}> Edit</label>
                    <label><input type="checkbox"> Del</label>
                  </div>
                </td>
                <td>
                  <div class="perm-checkboxes">
                    <label><input type="checkbox" ${mod.code === 'dashboard' || mod.code === 'payroll' ? 'checked' : ''}> View</label>
                    <label><input type="checkbox" disabled> Create</label>
                    <label><input type="checkbox" disabled> Edit</label>
                    <label><input type="checkbox" disabled> Del</label>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelector('#btn-save-permissions')?.addEventListener('click', () => {
    toastFn('Security matrix and role permissions updated successfully', 'success');
  });
}

// ============================================================================
// 4. ORGANIZATION MODULE
// ============================================================================
export function renderOrganizationView(container: HTMLElement) {
  const org = adminDataStore.organization;
  const branches = adminDataStore.branches;
  const depts = adminDataStore.departments;
  const units = adminDataStore.businessUnits;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active" data-org-tab="details">Organization Details</button>
          <button class="subnav-tab" data-org-tab="branches">Branches (${branches.length})</button>
          <button class="subnav-tab" data-org-tab="departments">Departments (${depts.length})</button>
          <button class="subnav-tab" data-org-tab="units">Business Units (${units.length})</button>
          <button class="subnav-tab" data-org-tab="hierarchy">Organization Hierarchy</button>
        </div>
      </div>

      <!-- ORG DETAILS OVERVIEW -->
      <div class="org-overview-grid">
        <div class="org-card primary-details">
          <div class="org-header-row">
            <div class="org-badge-icon"><i data-lucide="building"></i></div>
            <div>
              <h3>${org.name}</h3>
              <span class="text-mono text-muted">${org.code} • ${org.legalEntity}</span>
            </div>
          </div>
          <div class="org-fields-grid">
            <div class="org-field"><span class="lbl">Tax ID / EIN</span><span class="val">${org.taxId}</span></div>
            <div class="org-field"><span class="lbl">Base Currency</span><span class="val">${org.currency}</span></div>
            <div class="org-field"><span class="lbl">Default Timezone</span><span class="val">${org.timezone}</span></div>
            <div class="org-field"><span class="lbl">Headquarters</span><span class="val">${org.headquarters}</span></div>
            <div class="org-field"><span class="lbl">Founded Year</span><span class="val">${org.foundedYear}</span></div>
            <div class="org-field"><span class="lbl">Total Workforce</span><span class="val bold">128 Employees</span></div>
          </div>
        </div>

        <!-- BRANCHES LIST -->
        <div class="org-card branches-panel">
          <h4>Global Branches</h4>
          <div class="branches-list">
            ${branches.map(b => `
              <div class="branch-item">
                <div class="branch-info">
                  <strong>${b.name}</strong>
                  <span>${b.city}, ${b.country}</span>
                </div>
                <div class="branch-meta">
                  <span class="headcount-pill">${b.employeeCount} staff</span>
                  ${b.isHQ ? '<span class="hq-badge">HQ</span>' : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- DEPARTMENTS & BUSINESS UNITS TABLE -->
      <div class="admin-card-table" style="margin-top: 1.5rem;">
        <div class="table-card-title">
          <h4>Departments & Headcount Breakdown</h4>
        </div>
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Code</th>
              <th>Department Head</th>
              <th>Location Branch</th>
              <th>Headcount</th>
              <th>Monthly Budget</th>
            </tr>
          </thead>
          <tbody>
            ${depts.map(d => `
              <tr>
                <td><strong>${d.name}</strong></td>
                <td><span class="text-mono">${d.code}</span></td>
                <td>${d.head}</td>
                <td>${d.branch}</td>
                <td><span class="badge-count">${d.headcount}</span></td>
                <td><strong class="text-mono">${d.budget}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 5. EMPLOYEES MODULE
// ============================================================================
export function renderEmployeesView(container: HTMLElement) {
  const emps = adminDataStore.employees;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">Employee Directory (${emps.length})</button>
          <button class="subnav-tab" id="btn-add-emp"><i data-lucide="user-plus"></i> Add Employee</button>
          <button class="subnav-tab">Manager Assignment</button>
          <button class="subnav-tab">User Account Linking</button>
        </div>
        <div class="subnav-actions">
          <input type="text" id="emp-search" class="admin-search-input" placeholder="Search employee by name, code or position...">
          <button class="btn-primary-minimal" id="btn-add-emp-quick"><i data-lucide="plus"></i> New Employee</button>
        </div>
      </div>

      <div class="admin-card-table">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Job Position</th>
              <th>Grade</th>
              <th>Reporting Manager</th>
              <th>Status</th>
              <th>User Link</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody id="emp-table-body">
            ${emps.map(e => `
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-initials">${e.firstName[0]}${e.lastName[0]}</div>
                    <div class="user-cell-meta">
                      <strong>${e.firstName} ${e.lastName}</strong>
                      <span class="user-sub">${e.email}</span>
                    </div>
                  </div>
                </td>
                <td><span class="text-mono">${e.code}</span></td>
                <td>${e.department}</td>
                <td>${e.position}</td>
                <td><span class="grade-pill">${e.grade}</span></td>
                <td>${e.manager}</td>
                <td><span class="ref-status-pill ${e.status === 'ACTIVE' ? 'paid' : e.status === 'PROBATION' ? 'in-progress' : 'decline'}">${e.status}</span></td>
                <td>
                  <span class="link-badge ${e.linkedUserId ? 'linked' : 'unlinked'}">
                    ${e.linkedUserId ? '✓ Linked' : 'Unlinked'}
                  </span>
                </td>
                <td style="text-align: right;">
                  <button class="action-icon-btn" title="Edit Employee"><i data-lucide="edit"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Search filter
  const searchInput = container.querySelector('#emp-search') as HTMLInputElement;
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    container.querySelectorAll('#emp-table-body tr').forEach(row => {
      (row as HTMLElement).style.display = row.textContent?.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ============================================================================
// 6. POSITIONS & GRADES MODULE
// ============================================================================
export function renderPositionsGradesView(container: HTMLElement) {
  const positions = adminDataStore.positions;
  const grades = adminDataStore.grades;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">Job Positions (${positions.length})</button>
          <button class="subnav-tab">Job Grades & Hierarchy (${grades.length})</button>
          <button class="subnav-tab">Position History</button>
        </div>
        <div class="subnav-actions">
          <button class="btn-primary-minimal" id="btn-create-position"><i data-lucide="plus"></i> Add Position</button>
        </div>
      </div>

      <!-- GRADES SALARY BANDS GRID -->
      <div class="grades-hierarchy-grid">
        ${grades.map(g => `
          <div class="grade-card">
            <div class="grade-rank-badge">Rank ${g.hierarchyRank}</div>
            <h4>${g.code} — ${g.level}</h4>
            <div class="grade-salary">${g.minSalary} – ${g.maxSalary}</div>
            <span class="exp-req">${g.experienceYears} required experience</span>
          </div>
        `).join('')}
      </div>

      <!-- POSITIONS TABLE -->
      <div class="admin-card-table" style="margin-top: 1.5rem;">
        <div class="table-card-title">
          <h4>Configured Job Positions</h4>
        </div>
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Position Title</th>
              <th>Code</th>
              <th>Department</th>
              <th>Standard Grade</th>
              <th>Active Headcount</th>
              <th>Openings</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${positions.map(p => `
              <tr>
                <td><strong>${p.title}</strong></td>
                <td><span class="text-mono">${p.code}</span></td>
                <td>${p.department}</td>
                <td><span class="grade-pill">${p.grade}</span></td>
                <td><span class="badge-count">${p.filled} filled</span></td>
                <td><span class="badge-openings">${p.openings} open</span></td>
                <td style="text-align: right;">
                  <button class="action-icon-btn"><i data-lucide="edit"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================================================
// 7. WORKFLOWS & APPROVALS MODULE
// ============================================================================
export function renderWorkflowsApprovalsView(container: HTMLElement) {
  const workflows = adminDataStore.workflows;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">Approval Chains (${workflows.length})</button>
          <button class="subnav-tab">Assign Approvers</button>
          <button class="subnav-tab">Workflow Status Tracking</button>
        </div>
        <div class="subnav-actions">
          <button class="btn-primary-minimal" id="btn-add-wf"><i data-lucide="plus"></i> New Workflow</button>
        </div>
      </div>

      <div class="workflow-cards-grid">
        ${workflows.map(wf => `
          <div class="workflow-card">
            <div class="wf-top-line">
              <span class="wf-type-badge">${wf.type}</span>
              <span class="ref-status-pill paid">${wf.status}</span>
            </div>
            <h4>${wf.name}</h4>
            <div class="wf-chain-visual">
              ${wf.approvalChain.map((step, idx) => `
                <div class="wf-step">
                  <div class="step-circle">${idx + 1}</div>
                  <span class="step-name">${step}</span>
                </div>
                ${idx < wf.approvalChain.length - 1 ? '<div class="step-arrow">&rarr;</div>' : ''}
              `).join('')}
            </div>
            <div class="wf-footer-line">
              <span class="sla-text"><i data-lucide="clock"></i> SLA: ${wf.slaHours} hours response</span>
              <button class="btn-secondary-sm">Configure</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ============================================================================
// 8. AUDIT LOGS MODULE
// ============================================================================
export function renderAuditLogsView(container: HTMLElement) {
  const logs = adminDataStore.auditLogs;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs" id="audit-filter-tabs">
          <button class="subnav-tab active" data-filter="ALL">All Events (${logs.length})</button>
          <button class="subnav-tab" data-filter="LOGIN">Login History</button>
          <button class="subnav-tab" data-filter="RECORD_CHANGE">Record Changes</button>
          <button class="subnav-tab" data-filter="APPROVAL">Approval History</button>
          <button class="subnav-tab" data-filter="SECURITY">Security Events</button>
        </div>
        <div class="subnav-actions">
          <button class="btn-secondary-sm" id="btn-export-audit"><i data-lucide="download"></i> Export Audit Log</button>
        </div>
      </div>

      <div class="admin-card-table">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target Entity</th>
              <th>Audit Details</th>
              <th>IP Address</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody id="audit-table-body">
            ${logs.map(log => `
              <tr data-category="${log.type}">
                <td class="text-mono text-sm">${log.timestamp}</td>
                <td><strong>${log.actor}</strong></td>
                <td><span class="log-action">${log.action}</span></td>
                <td><span class="text-mono text-sm">${log.entity}</span></td>
                <td>${log.details}</td>
                <td class="text-mono text-sm">${log.ipAddress}</td>
                <td><span class="audit-type-pill ${log.type.toLowerCase()}">${log.type}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Tab filter
  container.querySelectorAll('#audit-filter-tabs .subnav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('#audit-filter-tabs .subnav-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = (btn as HTMLElement).dataset.filter;
      container.querySelectorAll('#audit-table-body tr').forEach(row => {
        const cat = (row as HTMLElement).dataset.category;
        (row as HTMLElement).style.display = filter === 'ALL' || cat === filter ? '' : 'none';
      });
    });
  });

  container.querySelector('#btn-export-audit')?.addEventListener('click', () => {
    toastFn('Audit log exported to CSV successfully', 'success');
  });
}

// ============================================================================
// 9. SYSTEM SETTINGS MODULE
// ============================================================================
export function renderSystemSettingsView(container: HTMLElement) {
  const s = adminDataStore.systemSettings;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">Company Settings</button>
          <button class="subnav-tab">Currency & Regional</button>
          <button class="subnav-tab">Email & SMTP</button>
          <button class="subnav-tab">Notification Dispatch</button>
        </div>
        <div class="subnav-actions">
          <button class="btn-primary-minimal" id="btn-save-settings"><i data-lucide="check"></i> Save Settings</button>
        </div>
      </div>

      <div class="settings-grid-layout">
        <!-- COMPANY PROFILE -->
        <div class="settings-card">
          <h4>Company Identification</h4>
          <div class="form-group">
            <label>Legal Entity Name</label>
            <input type="text" id="set-company-name" value="${s.companyName}">
          </div>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>System Currency</label>
              <select id="set-currency">
                <option value="USD ($)" ${s.currency.includes('USD') ? 'selected' : ''}>USD ($) — US Dollar</option>
                <option value="EUR (€)">EUR (€) — Euro</option>
                <option value="GBP (£)">GBP (£) — British Pound</option>
                <option value="INR (₹)">INR (₹) — Indian Rupee</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label>Default Language</label>
              <select id="set-lang">
                <option value="English (US)" selected>English (US)</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="German">Deutsch</option>
              </select>
            </div>
          </div>
        </div>

        <!-- REGIONAL & DATE FORMATS -->
        <div class="settings-card">
          <h4>Regional & Date Formats</h4>
          <div class="form-row">
            <div class="form-group flex-1">
              <label>Date Format</label>
              <select id="set-date-fmt">
                <option value="YYYY-MM-DD" selected>YYYY-MM-DD (ISO)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label>Time Format</label>
              <select id="set-time-fmt">
                <option value="12 Hours (AM/PM)" selected>12 Hours (AM/PM)</option>
                <option value="24 Hours">24 Hours (Military)</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>Fiscal Year Start</label>
            <input type="text" value="${s.fiscalYearStart}">
          </div>
        </div>

        <!-- EMAIL & SMTP CONFIGURATION -->
        <div class="settings-card">
          <h4>SMTP Email Server Settings</h4>
          <div class="form-row">
            <div class="form-group flex-2">
              <label>SMTP Host</label>
              <input type="text" value="${s.smtpHost}">
            </div>
            <div class="form-group flex-1">
              <label>Port</label>
              <input type="text" value="${s.smtpPort}">
            </div>
          </div>
          <div class="form-group">
            <label>Sender Address</label>
            <input type="email" value="${s.senderEmail}">
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-save-settings')?.addEventListener('click', () => {
    const compInput = container.querySelector('#set-company-name') as HTMLInputElement;
    if (compInput) adminDataStore.systemSettings.companyName = compInput.value;
    toastFn('System settings updated and synchronized', 'success');
  });
}

// ============================================================================
// 10. SECURITY MODULE
// ============================================================================
export function renderSecurityView(container: HTMLElement) {
  const s = adminDataStore.systemSettings;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">MFA Settings</button>
          <button class="subnav-tab">Session Management</button>
          <button class="subnav-tab">Password Policies</button>
          <button class="subnav-tab">Login & Security Logs</button>
        </div>
      </div>

      <div class="settings-grid-layout">
        <!-- MFA CARD -->
        <div class="settings-card">
          <div class="card-toggle-header">
            <div>
              <h4>Two-Factor Authentication (2FA / MFA)</h4>
              <p class="text-muted text-sm">Enforce multi-factor verification for administrative and payroll roles</p>
            </div>
            <label class="switch">
              <input type="checkbox" id="toggle-mfa" ${s.enforceMfa ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </div>
          <div class="mfa-methods-list" style="margin-top: 1rem;">
            <div class="method-item">
              <i data-lucide="shield-check"></i>
              <div>
                <strong>Authenticator App (TOTP)</strong>
                <span class="text-muted text-xs">Google Authenticator, Authy, 1Password</span>
              </div>
              <span class="badge-recommended">Recommended</span>
            </div>
            <div class="method-item">
              <i data-lucide="smartphone"></i>
              <div>
                <strong>SMS Verification Code</strong>
                <span class="text-muted text-xs">Sends 6-digit one time password to mobile</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PASSWORD POLICIES -->
        <div class="settings-card">
          <h4>Password Security Policies</h4>
          <div class="policy-items-list">
            <div class="policy-row">
              <span>Minimum Password Length</span>
              <strong class="text-mono">12 characters</strong>
            </div>
            <div class="policy-row">
              <span>Require Special Characters & Numbers</span>
              <span class="ref-status-pill paid">Enforced</span>
            </div>
            <div class="policy-row">
              <span>Password Expiration Period</span>
              <strong class="text-mono">90 days</strong>
            </div>
            <div class="policy-row">
              <span>Prevent Password Reuse</span>
              <strong class="text-mono">Last 5 passwords</strong>
            </div>
          </div>
        </div>

        <!-- SESSION MANAGEMENT -->
        <div class="settings-card">
          <h4>Active Sessions & Inactivity Timeout</h4>
          <div class="policy-row">
            <span>Session Inactivity Timeout</span>
            <strong class="text-mono">${s.sessionTimeoutMins} minutes</strong>
          </div>
          <div style="margin-top: 1rem;">
            <button class="btn-danger-outline" id="btn-revoke-sessions"><i data-lucide="log-out"></i> Revoke All Other Active Sessions</button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#toggle-mfa')?.addEventListener('change', (e) => {
    adminDataStore.systemSettings.enforceMfa = (e.target as HTMLInputElement).checked;
    toastFn(`MFA enforcement updated: ${adminDataStore.systemSettings.enforceMfa ? 'Enabled' : 'Disabled'}`, 'info');
  });

  container.querySelector('#btn-revoke-sessions')?.addEventListener('click', () => {
    toastFn('All other active web sessions terminated immediately', 'success');
  });
}

// ============================================================================
// 11. STORAGE & DOCUMENTS MODULE
// ============================================================================
export function renderStorageDocumentsView(container: HTMLElement) {
  const docs = adminDataStore.documents;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">Employee Documents (${docs.length})</button>
          <button class="subnav-tab">Document Categories</button>
          <button class="subnav-tab">Version History</button>
          <button class="subnav-tab">Access Permissions</button>
        </div>
        <div class="subnav-actions">
          <button class="btn-primary-minimal" id="btn-upload-doc"><i data-lucide="upload"></i> Upload Document</button>
        </div>
      </div>

      <div class="admin-card-table">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Document Name</th>
              <th>Category</th>
              <th>Associated Employee</th>
              <th>Version</th>
              <th>Size</th>
              <th>Uploaded Date</th>
              <th>Access Level</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map(doc => `
              <tr>
                <td>
                  <div class="doc-cell">
                    <i data-lucide="file-text" class="doc-icon"></i>
                    <strong>${doc.name}</strong>
                  </div>
                </td>
                <td><span class="category-pill">${doc.category}</span></td>
                <td>${doc.employeeName}</td>
                <td><span class="text-mono text-sm">${doc.version}</span></td>
                <td class="text-muted text-sm">${doc.size}</td>
                <td class="text-muted text-sm">${doc.uploadedAt}</td>
                <td><span class="access-pill ${doc.accessLevel.toLowerCase().replace(' ', '-')}">${doc.accessLevel}</span></td>
                <td style="text-align: right;">
                  <button class="action-icon-btn" title="Download Document"><i data-lucide="download"></i></button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.querySelector('#btn-upload-doc')?.addEventListener('click', () => {
    toastFn('Document upload drawer opened', 'info');
  });
}

// ============================================================================
// 12. NOTIFICATIONS MODULE
// ============================================================================
export function renderNotificationsView(container: HTMLElement) {
  const templates = adminDataStore.notificationTemplates;

  container.innerHTML = `
    <div class="admin-module-page">
      <div class="admin-subnav-bar">
        <div class="subnav-tabs">
          <button class="subnav-tab active">Notification Templates (${templates.length})</button>
          <button class="subnav-tab">Email Notifications Log</button>
          <button class="subnav-tab">System Notifications Feed</button>
        </div>
        <div class="subnav-actions">
          <button class="btn-primary-minimal" id="btn-create-template"><i data-lucide="plus"></i> New Template</button>
        </div>
      </div>

      <div class="templates-grid">
        ${templates.map(t => `
          <div class="template-card">
            <div class="template-top">
              <span class="wf-type-badge">${t.type}</span>
              <label class="switch">
                <input type="checkbox" ${t.active ? 'checked' : ''}>
                <span class="slider round"></span>
              </label>
            </div>
            <h4>${t.name}</h4>
            <div class="template-subject">
              <span class="lbl">Subject Line:</span>
              <span class="val text-mono">${t.subject}</span>
            </div>
            <div class="template-footer">
              <span class="trigger-text">Trigger: ${t.trigger}</span>
              <button class="btn-secondary-sm">Edit Template</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelector('#btn-create-template')?.addEventListener('click', () => {
    toastFn('Notification template builder initialized', 'info');
  });
}
