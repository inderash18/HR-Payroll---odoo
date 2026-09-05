import { User as UserType } from '../../api/types';
import { router } from '../../router';
import { authStore } from '../../state/auth';
import { refreshIcons, showToast } from '../../utils/ui';

export function renderDashboardShell(container: HTMLElement, user: UserType, onQuickAdd?: () => void): void {
  const displayName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : (user?.firstName || (user as any)?.name || 'Development Admin');
  const initials = `${user?.firstName ? user.firstName.charAt(0) : 'D'}${user?.lastName ? user.lastName.charAt(0) : 'A'}`.toUpperCase();
  const roleLabel = (user?.role || 'ADMIN').replace(/_/g, ' ');
  const currentTab = router.getCurrentMatch().tab;

  container.innerHTML = `
    <div class="app-shell">
      <!-- ULTRA-DARK SLIM SIDEBAR -->
      <aside class="sidebar-dark">
        <div class="sidebar-logo" id="sidebar-logo-btn" title="PeoplePay360" style="cursor: pointer;">
          <i data-lucide="menu" style="width: 22px; height: 22px;"></i>
        </div>

        <nav class="sidebar-nav">
          <a href="/dashboard" class="sidebar-nav-item ${currentTab === 'dashboard' ? 'active' : ''}" data-path="/dashboard" data-tab="dashboard" data-tooltip="Dashboard">
            <i data-lucide="home"></i>
          </a>
          <a href="/employees" class="sidebar-nav-item ${currentTab === 'employees' || currentTab === 'employee-detail' ? 'active' : ''}" data-path="/employees" data-tab="employees" data-tooltip="Employees">
            <i data-lucide="user"></i>
          </a>
          <a href="/leaves" class="sidebar-nav-item ${currentTab === 'leaves' ? 'active' : ''}" data-path="/leaves" data-tab="leaves" data-tooltip="Time Off">
            <i data-lucide="message-square"></i>
          </a>
          <a href="/schedules" class="sidebar-nav-item ${currentTab === 'schedules' ? 'active' : ''}" data-path="/schedules" data-tab="schedules" data-tooltip="Schedules">
            <i data-lucide="calendar"></i>
          </a>
          <a href="/attendance" class="sidebar-nav-item ${currentTab === 'attendance' ? 'active' : ''}" data-path="/attendance" data-tab="attendance" data-tooltip="Attendance">
            <i data-lucide="clock"></i>
          </a>
          <a href="/departments" class="sidebar-nav-item ${currentTab === 'departments' ? 'active' : ''}" data-path="/departments" data-tab="departments" data-tooltip="Departments">
            <i data-lucide="building-2"></i>
          </a>
          <a href="/contracts" class="sidebar-nav-item ${currentTab === 'contracts' ? 'active' : ''}" data-path="/contracts" data-tab="contracts" data-tooltip="Contracts">
            <i data-lucide="file-signature"></i>
          </a>
          <a href="/payroll" class="sidebar-nav-item ${currentTab === 'payroll' || currentTab === 'payrun-detail' ? 'active' : ''}" data-path="/payroll" data-tab="payroll" data-tooltip="Payroll">
            <i data-lucide="landmark"></i>
          </a>
          <a href="/payslips" class="sidebar-nav-item ${currentTab === 'payslips' || currentTab === 'payslip-detail' ? 'active' : ''}" data-path="/payslips" data-tab="payslips" data-tooltip="Payslips">
            <i data-lucide="line-chart"></i>
          </a>
          <a href="/users" class="sidebar-nav-item ${currentTab === 'users' ? 'active' : ''}" data-path="/users" data-tab="users" data-tooltip="Users">
            <i data-lucide="user-check"></i>
          </a>
          <a href="/audit" class="sidebar-nav-item ${currentTab === 'audit' ? 'active' : ''}" data-path="/audit" data-tab="audit" data-tooltip="Audit Logs">
            <i data-lucide="file-text"></i>
          </a>
          <a href="/security" class="sidebar-nav-item ${currentTab === 'security' || currentTab === 'sessions' ? 'active' : ''}" data-path="/security" data-tab="security" data-tooltip="Account Security">
            <i data-lucide="shield"></i>
          </a>
          <a href="/settings" class="sidebar-nav-item ${currentTab === 'settings' ? 'active' : ''}" data-path="/settings" data-tab="settings" data-tooltip="Settings">
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
        <!-- TOPBAR -->
        <header class="topbar-clean">
          <h1 class="topbar-title" id="header-tab-title">Dashboard</h1>

          <div class="topbar-center">
            <div class="search-pill-box">
              <i data-lucide="search"></i>
              <input type="text" id="topbar-global-search" placeholder="Search across PeoplePay360..." autocomplete="off" />
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

            <!-- PROFILE PILL & FLOATING SAAS DROPDOWN MENU -->
            <div class="profile-dropdown-container">
              <div class="user-profile-pill" id="user-profile-menu-trigger">
                <div class="user-avatar-initials">${initials}</div>
                <span class="user-profile-name">${displayName}</span>
                <i data-lucide="chevron-down" style="width: 14px; height: 14px; color: var(--text-muted); margin-left: -2px;"></i>
              </div>

              <div class="profile-dropdown-menu" id="profile-dropdown-menu">
                <div class="dropdown-user-header">
                  <div class="dropdown-user-name">${displayName}</div>
                  <div class="dropdown-user-email">${user?.email || 'admin@peoplepay360.local'}</div>
                  <span class="dropdown-user-role">${roleLabel}</span>
                </div>
                <div class="dropdown-nav-list">
                  <div class="dropdown-nav-item" data-action="profile">
                    <i data-lucide="user"></i>
                    <span>My Profile</span>
                  </div>
                  <div class="dropdown-nav-item" data-action="security">
                    <i data-lucide="shield"></i>
                    <span>Account Security</span>
                  </div>
                  <div class="dropdown-nav-item" data-action="sessions">
                    <i data-lucide="laptop"></i>
                    <span>Active Sessions</span>
                  </div>
                  <div class="dropdown-divider"></div>
                  <div class="dropdown-nav-item logout-danger" data-action="logout">
                    <i data-lucide="log-out"></i>
                    <span>Sign Out</span>
                  </div>
                </div>
              </div>
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

  // Profile dropdown menu toggle listener
  const trigger = container.querySelector('#user-profile-menu-trigger');
  const dropdown = container.querySelector('#profile-dropdown-menu');

  trigger?.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown?.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!trigger?.contains(e.target as Node) && !dropdown?.contains(e.target as Node)) {
      dropdown?.classList.remove('show');
    }
  });

  // Dropdown action items
  dropdown?.querySelectorAll('.dropdown-nav-item[data-action]').forEach((item) => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      dropdown.classList.remove('show');
      const action = (item as HTMLElement).dataset.action;

      if (action === 'logout') {
        await authStore.logout();
        router.navigate('/login', { replace: true });
        showToast('Signed out successfully', 'info');
      } else if (action === 'profile') {
        router.navigate('/profile');
      } else if (action === 'security') {
        router.navigate('/security');
      } else if (action === 'sessions') {
        router.navigate('/sessions');
      }
    });
  });

  // Sidebar logo click -> dashboard
  container.querySelector('#sidebar-logo-btn')?.addEventListener('click', () => {
    router.navigate('/dashboard');
  });

  // Tab navigation listeners (Push state into browser history stack)
  container.querySelectorAll('.sidebar-nav-item[data-path]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const path = (btn as HTMLElement).dataset.path;
      if (path) {
        router.navigate(path);
      }
    });
  });

  // Quick Add Button
  container.querySelector('#btn-quick-add')?.addEventListener('click', () => {
    if (onQuickAdd) {
      onQuickAdd();
    }
  });

  // Notifications button click
  container.querySelector('#btn-topbar-notifications')?.addEventListener('click', () => {
    showToast('All notifications are up to date.', 'info');
  });

  // Global search input
  const globalSearch = container.querySelector('#topbar-global-search') as HTMLInputElement;
  globalSearch?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = globalSearch.value.trim().toLowerCase();
      if (q.includes('emp')) router.navigate('/employees');
      else if (q.includes('dept')) router.navigate('/departments');
      else if (q.includes('pay') || q.includes('run')) router.navigate('/payroll');
      else if (q.includes('slip')) router.navigate('/payslips');
      else if (q.includes('leave') || q.includes('time')) router.navigate('/leaves');
      else if (q.includes('attend')) router.navigate('/attendance');
      else if (q.includes('user')) router.navigate('/users');
      else if (q.includes('sec') || q.includes('pass')) router.navigate('/security');
      else if (q.includes('sess')) router.navigate('/sessions');
      else if (q.includes('prof')) router.navigate('/profile');
      else if (q.includes('audit') || q.includes('log')) router.navigate('/audit');
      else if (q.includes('set')) router.navigate('/settings');
    }
  });

  // Logout listener (bottom sidebar icon)
  document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await authStore.logout();
    router.navigate('/login', { replace: true });
    showToast('Signed out successfully', 'info');
  });

  refreshIcons();
}
