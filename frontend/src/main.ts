import { createIcons, LayoutDashboard, Users, Building2, Briefcase, FileSignature, CalendarClock, Clock, CalendarRange, Landmark, LineChart, Settings, Search, Bell, ChevronDown, UserPlus, FileText, CheckCircle, Clock4, AlertTriangle, User } from 'lucide';
import './style.css';

const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <div class="hr-dashboard">
      <!-- SIDEBAR -->
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
            <span>HR Management</span>
          </div>
        </div>

        <nav class="nav-menu">
          <a href="#" class="nav-item active"><i data-lucide="layout-dashboard"></i> Dashboard</a>
          <a href="#" class="nav-item"><i data-lucide="users"></i> Employees</a>
          <a href="#" class="nav-item"><i data-lucide="building-2"></i> Departments</a>
          <a href="#" class="nav-item"><i data-lucide="briefcase"></i> Job Positions</a>
          <a href="#" class="nav-item"><i data-lucide="file-signature"></i> Contracts</a>
          <a href="#" class="nav-item"><i data-lucide="calendar-clock"></i> Working Schedules</a>
          <a href="#" class="nav-item"><i data-lucide="clock"></i> Attendance</a>
          <a href="#" class="nav-item"><i data-lucide="calendar-range"></i> Time Off</a>
          <a href="#" class="nav-item"><i data-lucide="landmark"></i> Payroll</a>
          <a href="#" class="nav-item"><i data-lucide="line-chart"></i> Reports</a>
          <div class="nav-divider"></div>
          <a href="#" class="nav-item"><i data-lucide="settings"></i> Settings</a>
        </nav>
      </aside>

      <!-- MAIN CONTENT -->
      <main class="main-content">
        <!-- HEADER -->
        <header class="topbar">
          <div class="header-titles">
            <h1>HR Dashboard</h1>
            <p>Overview of your workforce and HR activities</p>
          </div>
          
          <div class="header-actions">
            <div class="search-bar">
              <i data-lucide="search"></i>
              <input type="text" placeholder="Search employees, departments, contracts...">
            </div>
            
            <button class="icon-btn notification-btn">
              <i data-lucide="bell"></i>
              <span class="badge">3</span>
            </button>
            
            <div class="user-profile">
              <div class="avatar">
                <img src="https://ui-avatars.com/api/?name=HR+Manager&background=eef2ff&color=4f46e5" alt="HR Manager">
              </div>
              <div class="user-info">
                <span class="user-name">Sarah Jenkins</span>
                <span class="user-role">HR Manager</span>
              </div>
              <i data-lucide="chevron-down" class="dropdown-icon"></i>
            </div>
          </div>
        </header>

        <!-- DASHBOARD GRID -->
        <div class="dashboard-layout">
          
          <!-- CENTRAL AREA -->
          <div class="central-area">
            
            <!-- SECTION 1: KPIs -->
            <section class="kpi-grid">
              <div class="kpi-card clickable">
                <div class="kpi-header">
                  <div class="kpi-icon blue"><i data-lucide="users"></i></div>
                  <span class="trend positive">+6 this month</span>
                </div>
                <div class="kpi-value">125</div>
                <div class="kpi-label">Total Employees</div>
              </div>
              
              <div class="kpi-card clickable">
                <div class="kpi-header">
                  <div class="kpi-icon green"><i data-lucide="check-circle"></i></div>
                  <span class="trend neutral">94.4% of workforce</span>
                </div>
                <div class="kpi-value">118</div>
                <div class="kpi-label">Active Employees</div>
              </div>
              
              <div class="kpi-card clickable">
                <div class="kpi-header">
                  <div class="kpi-icon orange"><i data-lucide="calendar-range"></i></div>
                  <span class="trend neutral">4.0% of workforce</span>
                </div>
                <div class="kpi-value">5</div>
                <div class="kpi-label">On Leave</div>
              </div>
              
              <div class="kpi-card clickable alert-state">
                <div class="kpi-header">
                  <div class="kpi-icon red"><i data-lucide="clock4"></i></div>
                  <span class="trend negative">Requires attention</span>
                </div>
                <div class="kpi-value">7</div>
                <div class="kpi-label">Pending Requests</div>
              </div>
            </section>

            <!-- MIDDLE CHARTS GRID -->
            <div class="charts-grid">
              
              <!-- SECTION 2: ATTENDANCE -->
              <div class="card attendance-card">
                <div class="card-header">
                  <h2>Today's Attendance</h2>
                  <button class="btn-text">View Attendance</button>
                </div>
                <div class="card-body attendance-body">
                  <div class="chart-container">
                    <div class="donut-chart attendance-chart">
                      <div class="donut-inner">
                        <span class="donut-val">94.2%</span>
                        <span class="donut-lbl">Rate</span>
                      </div>
                    </div>
                  </div>
                  <div class="attendance-stats">
                    <div class="stat-row"><span class="dot green"></span> Present <strong>108</strong></div>
                    <div class="stat-row"><span class="dot yellow"></span> Late <strong>7</strong></div>
                    <div class="stat-row"><span class="dot red"></span> Absent <strong>6</strong></div>
                    <div class="stat-row"><span class="dot blue"></span> On Leave <strong>4</strong></div>
                  </div>
                </div>
                <div class="card-footer alert-footer">
                  <span><i data-lucide="alert-triangle"></i> 3 Missing Check-outs</span>
                  <span><i data-lucide="alert-triangle"></i> 2 Manual Corrections</span>
                </div>
              </div>

              <!-- SECTION 3: TIME OFF -->
              <div class="card timeoff-card">
                <div class="card-header">
                  <h2>Time Off Requests</h2>
                  <button class="btn-text">View Requests</button>
                </div>
                <div class="card-body">
                  <div class="status-bars">
                    <div class="status-bar-item">
                      <div class="status-lbl">Pending <span class="badge orange">7</span></div>
                      <div class="bar-bg"><div class="bar-fill orange" style="width: 25%"></div></div>
                    </div>
                    <div class="status-bar-item">
                      <div class="status-lbl">Approved <span class="badge green">18</span></div>
                      <div class="bar-bg"><div class="bar-fill green" style="width: 65%"></div></div>
                    </div>
                    <div class="status-bar-item">
                      <div class="status-lbl">Refused <span class="badge red">2</span></div>
                      <div class="bar-bg"><div class="bar-fill red" style="width: 10%"></div></div>
                    </div>
                  </div>
                  
                  <h3 class="sub-heading">Recent Requests</h3>
                  <ul class="request-list">
                    <li>
                      <div class="req-info">
                        <strong>Arun Kumar</strong>
                        <span>Casual Leave</span>
                      </div>
                      <span class="status-tag pending">Pending</span>
                    </li>
                    <li>
                      <div class="req-info">
                        <strong>Priya S</strong>
                        <span>Sick Leave</span>
                      </div>
                      <span class="status-tag approved">Approved</span>
                    </li>
                    <li>
                      <div class="req-info">
                        <strong>Karthik R</strong>
                        <span>Annual Leave</span>
                      </div>
                      <span class="status-tag pending">Pending</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- BOTTOM CHARTS GRID -->
            <div class="charts-grid">
              
              <!-- SECTION 4: EMPLOYEE OVERVIEW -->
              <div class="card employee-card">
                <div class="card-header">
                  <h2>Employee Overview</h2>
                  <button class="btn-text">View Employees</button>
                </div>
                <div class="card-body">
                  <div class="bar-chart-container">
                    <div class="bar-item">
                      <div class="bar-label">IT</div>
                      <div class="bar-track"><div class="bar-fill blue" style="width: 100%"></div></div>
                      <div class="bar-value">42</div>
                    </div>
                    <div class="bar-item">
                      <div class="bar-label">Sales</div>
                      <div class="bar-track"><div class="bar-fill blue" style="width: 75%"></div></div>
                      <div class="bar-value">31</div>
                    </div>
                    <div class="bar-item">
                      <div class="bar-label">Operations</div>
                      <div class="bar-track"><div class="bar-fill blue" style="width: 60%"></div></div>
                      <div class="bar-value">25</div>
                    </div>
                    <div class="bar-item">
                      <div class="bar-label">Finance</div>
                      <div class="bar-track"><div class="bar-fill blue" style="width: 35%"></div></div>
                      <div class="bar-value">15</div>
                    </div>
                    <div class="bar-item">
                      <div class="bar-label">HR</div>
                      <div class="bar-track"><div class="bar-fill blue" style="width: 28%"></div></div>
                      <div class="bar-value">12</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECTION 5: CONTRACT STATUS -->
              <div class="card contract-card">
                <div class="card-header">
                  <h2>Contract Status</h2>
                  <button class="btn-text">Review Contracts</button>
                </div>
                <div class="card-body">
                  <div class="contract-stats">
                    <div class="c-stat">
                      <span class="c-val">112</span>
                      <span class="c-lbl">Active Contracts</span>
                    </div>
                    <div class="c-stat highlight-red">
                      <span class="c-val">3</span>
                      <span class="c-lbl">Expiring This Month</span>
                    </div>
                    <div class="c-stat">
                      <span class="c-val">2</span>
                      <span class="c-lbl">Expired</span>
                    </div>
                    <div class="c-stat">
                      <span class="c-val">8</span>
                      <span class="c-lbl">Draft</span>
                    </div>
                  </div>
                  
                  <div class="alert-box warning mt-4">
                    <i data-lucide="alert-triangle"></i>
                    <span><strong>Action Required:</strong> 3 contracts expire this month.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT PANEL -->
          <aside class="right-panel">
            
            <!-- SECTION 8: QUICK ACTIONS -->
            <div class="panel-section">
              <h2 class="panel-title">Quick Actions</h2>
              <div class="quick-actions-grid">
                <button class="action-btn"><i data-lucide="user-plus"></i> Add Employee</button>
                <button class="action-btn"><i data-lucide="file-signature"></i> Create Contract</button>
                <button class="action-btn"><i data-lucide="check-circle"></i> Review Leave Requests</button>
                <button class="action-btn"><i data-lucide="clock"></i> View Attendance</button>
              </div>
            </div>

            <!-- SECTION 6: HR ATTENTION -->
            <div class="panel-section">
              <div class="section-header">
                <h2 class="panel-title">HR Attention</h2>
                <a href="#" class="link-small">View All</a>
              </div>
              <ul class="alert-list">
                <li class="alert-item clickable">
                  <i data-lucide="alert-triangle" class="text-orange"></i>
                  <span>3 contracts expiring soon</span>
                </li>
                <li class="alert-item clickable">
                  <i data-lucide="alert-triangle" class="text-red"></i>
                  <span>3 employees missing checkout</span>
                </li>
                <li class="alert-item clickable">
                  <i data-lucide="alert-triangle" class="text-orange"></i>
                  <span>5 pending leave requests</span>
                </li>
                <li class="alert-item clickable">
                  <i data-lucide="alert-triangle" class="text-blue"></i>
                  <span>2 attendance corrections</span>
                </li>
              </ul>
            </div>

            <!-- SECTION 7: RECENT EMPLOYEES -->
            <div class="panel-section">
              <div class="section-header">
                <h2 class="panel-title">Recently Added</h2>
                <a href="#" class="link-small">View All Employees</a>
              </div>
              <ul class="recent-employees">
                <li>
                  <div class="emp-avatar">AK</div>
                  <div class="emp-details">
                    <strong>Arun Kumar</strong>
                    <span>Software Developer • IT</span>
                  </div>
                  <div class="emp-date">Sep 02</div>
                </li>
                <li>
                  <div class="emp-avatar">PS</div>
                  <div class="emp-details">
                    <strong>Priya S</strong>
                    <span>HR Executive • HR</span>
                  </div>
                  <div class="emp-date">Aug 28</div>
                </li>
                <li>
                  <div class="emp-avatar">KR</div>
                  <div class="emp-details">
                    <strong>Karthik R</strong>
                    <span>Sales Executive • Sales</span>
                  </div>
                  <div class="emp-date">Aug 25</div>
                </li>
              </ul>
            </div>

            <!-- SECTION 9: HR INSIGHTS -->
            <div class="panel-section insights-card">
              <h2 class="panel-title">HR Insights</h2>
              <ul class="insights-list">
                <li><span class="bullet green"></span> Attendance improved by 2.4% compared with last month.</li>
                <li><span class="bullet orange"></span> 3 employee contracts require renewal this month.</li>
                <li><span class="bullet blue"></span> 7 leave requests are waiting for approval.</li>
              </ul>
            </div>

          </aside>
        </div>
      </main>
    </div>
  `;

  createIcons({
    icons: {
      LayoutDashboard, Users, Building2, Briefcase, FileSignature, CalendarClock, 
      Clock, CalendarRange, Landmark, LineChart, Settings, Search, Bell, ChevronDown,
      UserPlus, FileText, CheckCircle, Clock4, AlertTriangle, User
    }
  });
}
