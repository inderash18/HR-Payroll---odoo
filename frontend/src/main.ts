import { createIcons, LayoutDashboard, Users, Briefcase, CalendarClock, Search, Bell, ChevronDown, UserPlus, FileText, CheckCircle, Clock4, AlertTriangle } from 'lucide';
import './style.css';

const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <div class="hr-dashboard">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="brand-text">
            <h2>PeoplePay360</h2>
            <span>HR</span>
          </div>
        </div>

        <nav class="nav-menu">
          <a href="#" class="nav-item active"><i data-lucide="layout-dashboard"></i> Dashboard</a>
          <a href="#" class="nav-item"><i data-lucide="users"></i> Employees</a>
          <a href="#" class="nav-item"><i data-lucide="calendar-clock"></i> Attendance</a>
          <a href="#" class="nav-item"><i data-lucide="briefcase"></i> Payroll</a>
          <a href="#" class="nav-item"><i data-lucide="file-text"></i> Contracts</a>
        </nav>

        <div class="sidebar-footer">
          <div class="mini-card">
            <span>Payroll total</span>
            <strong>$148.2K</strong>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <header class="topbar">
          <div class="header-titles">
            <p class="eyebrow">Overview</p>
            <h1>Dashboard</h1>
          </div>

          <div class="header-actions">
            <div class="search-bar">
              <i data-lucide="search"></i>
              <input type="text" placeholder="Search employees, payroll, contracts...">
            </div>

            <button class="icon-btn" aria-label="Notifications">
              <i data-lucide="bell"></i>
              <span class="badge">2</span>
            </button>

            <div class="user-profile">
              <div class="avatar">SJ</div>
              <div class="user-info">
                <span class="user-name">Sarah Jenkins</span>
                <span class="user-role">HR Manager</span>
              </div>
              <i data-lucide="chevron-down" class="dropdown-icon"></i>
            </div>
          </div>
        </header>

        <div class="content-shell">
          <section class="panel summary-panel">
            <div class="panel-header">
              <h2>Workforce snapshot</h2>
              <button class="btn-text">This month</button>
            </div>

            <div class="kpi-grid">
              <article class="kpi-card">
                <div class="kpi-header">
                  <div class="kpi-icon blue"><i data-lucide="users"></i></div>
                  <span class="trend positive">+6%</span>
                </div>
                <div class="kpi-value">125</div>
                <div class="kpi-label">Employees</div>
              </article>

              <article class="kpi-card">
                <div class="kpi-header">
                  <div class="kpi-icon green"><i data-lucide="check-circle"></i></div>
                  <span class="trend neutral">93.8%</span>
                </div>
                <div class="kpi-value">118</div>
                <div class="kpi-label">Active</div>
              </article>

              <article class="kpi-card">
                <div class="kpi-header">
                  <div class="kpi-icon orange"><i data-lucide="clock4"></i></div>
                  <span class="trend neutral">4.0%</span>
                </div>
                <div class="kpi-value">5</div>
                <div class="kpi-label">On leave</div>
              </article>

              <article class="kpi-card alert-card">
                <div class="kpi-header">
                  <div class="kpi-icon red"><i data-lucide="alert-triangle"></i></div>
                  <span class="trend negative">Action</span>
                </div>
                <div class="kpi-value">7</div>
                <div class="kpi-label">Pending</div>
              </article>
            </div>
          </section>

          <div class="module-grid">
            <article class="panel">
              <div class="panel-header">
                <h2>Attendance</h2>
                <button class="btn-text">View all</button>
              </div>

              <div class="attendance-summary">
                <div class="donut-wrap">
                  <div class="donut-chart">
                    <div class="donut-inner">
                      <span>94%</span>
                    </div>
                  </div>
                </div>

                <div class="attendance-breakdown">
                  <div class="stat-row"><span class="dot green"></span> Present <strong>108</strong></div>
                  <div class="stat-row"><span class="dot yellow"></span> Late <strong>7</strong></div>
                  <div class="stat-row"><span class="dot red"></span> Absent <strong>6</strong></div>
                  <div class="stat-row"><span class="dot blue"></span> Leave <strong>4</strong></div>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-header">
                <h2>Leave requests</h2>
                <button class="btn-text">Review</button>
              </div>

              <div class="leave-stack">
                <div class="pill-row">
                  <span class="pill approved">18 approved</span>
                  <span class="pill pending">7 pending</span>
                </div>

                <ul class="mini-list">
                  <li>
                    <div>
                      <strong>Arun Kumar</strong>
                      <small>Casual leave</small>
                    </div>
                    <span class="status-tag pending">Pending</span>
                  </li>
                  <li>
                    <div>
                      <strong>Priya S</strong>
                      <small>Sick leave</small>
                    </div>
                    <span class="status-tag approved">Approved</span>
                  </li>
                </ul>
              </div>
            </article>
          </div>

          <section class="panel list-panel">
            <div class="panel-header">
              <h2>Priority items</h2>
              <button class="btn-text">Review</button>
            </div>

            <ul class="task-list">
              <li>
                <span class="task-bullet warning"></span>
                <div class="task-copy">
                  <strong>3 contracts expiring soon</strong>
                  <small>Action required this week</small>
                </div>
                <span class="task-tag high">High</span>
              </li>
              <li>
                <span class="task-bullet danger"></span>
                <div class="task-copy">
                  <strong>3 employees missing checkout</strong>
                  <small>Attendance review</small>
                </div>
                <span class="task-tag medium">Medium</span>
              </li>
              <li>
                <span class="task-bullet info"></span>
                <div class="task-copy">
                  <strong>5 leave approvals waiting</strong>
                  <small>Manager follow-up</small>
                </div>
                <span class="task-tag low">Low</span>
              </li>
            </ul>
          </section>
        </div>
      </main>

      <aside class="rail-panel">
        <section class="panel side-panel">
          <div class="panel-header compact">
            <h2>Quick actions</h2>
          </div>

          <div class="action-list">
            <button class="action-btn"><i data-lucide="user-plus"></i> Add employee</button>
            <button class="action-btn"><i data-lucide="file-text"></i> Create contract</button>
            <button class="action-btn"><i data-lucide="check-circle"></i> Approve leaves</button>
          </div>
        </section>

        <section class="panel side-panel">
          <div class="panel-header compact">
            <h2>Team pulse</h2>
          </div>

          <div class="pulse-list">
            <div class="pulse-item">
              <span>Attendance</span>
              <strong>+2.4%</strong>
            </div>
            <div class="pulse-item">
              <span>Retention</span>
              <strong>96.7%</strong>
            </div>
            <div class="pulse-item">
              <span>Leave use</span>
              <strong>11 days</strong>
            </div>
          </div>
        </section>
      </aside>
    </div>
  `;

  createIcons({
    icons: {
      LayoutDashboard,
      Users,
      Briefcase,
      CalendarClock,
      Search,
      Bell,
      ChevronDown,
      UserPlus,
      FileText,
      CheckCircle,
      Clock4,
      AlertTriangle
    }
  });
}
