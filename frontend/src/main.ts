import { createIcons, LayoutDashboard, Users, Clock, CalendarRange, PieChart, Search, Bell, Menu, TrendingUp, UserCheck, MoreVertical, CheckCircle, XCircle } from 'lucide';
import './style.css';

const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <div class="dashboard-wrapper">
      
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="brand">
          <div class="logo-circle">
            <span>P</span>
          </div>
        </div>
        <nav class="nav-links">
          <div class="nav-icon active"><i data-lucide="layout-dashboard"></i></div>
          <div class="nav-icon"><i data-lucide="users"></i></div>
          <div class="nav-icon"><i data-lucide="clock"></i></div>
          <div class="nav-icon"><i data-lucide="calendar-range"></i></div>
          <div class="nav-icon"><i data-lucide="pie-chart"></i></div>
        </nav>
        <div class="nav-bottom">
          <div class="nav-icon user-profile">
            <img src="https://ui-avatars.com/api/?name=HR&background=4318FF&color=fff" alt="User">
          </div>
        </div>
      </aside>

      <!-- MAIN AREA -->
      <div class="main-area">
        
        <!-- HEADER -->
        <header class="top-header">
          <div class="header-text">
            <h1>Overview</h1>
            <p>Welcome back, HR Manager!</p>
          </div>
          <div class="header-actions">
            <div class="search-box">
              <i data-lucide="search"></i>
              <input type="text" placeholder="Search globally...">
            </div>
            <button class="icon-btn"><i data-lucide="bell"></i><span class="badge">2</span></button>
          </div>
        </header>

        <!-- DASHBOARD GRID -->
        <main class="dashboard-grid">
          
          <!-- TOP LEFT: BIG GRAPH -->
          <div class="card card-graph">
            <div class="card-header">
              <h2>Employee Growth</h2>
              <div class="filter-pills">
                <button class="active">1M</button>
                <button>6M</button>
                <button>1Y</button>
              </div>
            </div>
            <div class="card-body">
              <div class="graph-stats">
                <h3>+14.5%</h3>
                <span class="trend-up"><i data-lucide="trending-up"></i> vs last month</span>
              </div>
              <div class="svg-graph-container">
                <svg viewBox="0 0 500 150" preserveAspectRatio="none" style="width:100%; height:100%;">
                  <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stop-color="#4318FF" stop-opacity="0.4"/>
                      <stop offset="100%" stop-color="#4318FF" stop-opacity="0.0"/>
                    </linearGradient>
                  </defs>
                  <path d="M0,150 L0,100 C50,120 150,40 250,70 C350,100 450,20 500,40 L500,150 Z" fill="url(#gradient)"></path>
                  <path d="M0,100 C50,120 150,40 250,70 C350,100 450,20 500,40" fill="none" stroke="#4318FF" stroke-width="4"></path>
                </svg>
              </div>
            </div>
          </div>

          <!-- TOP RIGHT: SEARCH EMPLOYEE -->
          <div class="card card-search">
            <div class="card-header">
              <h2>Employee Directory</h2>
              <i data-lucide="more-vertical" class="text-muted"></i>
            </div>
            <div class="card-body">
              <div class="local-search">
                <i data-lucide="search"></i>
                <input type="text" placeholder="Find employee...">
              </div>
              <div class="employee-list">
                <div class="emp-item">
                  <img src="https://ui-avatars.com/api/?name=Arun+Kumar&background=E0E5FF&color=4318FF" class="avatar" />
                  <div class="emp-info">
                    <h4>Arun Kumar</h4>
                    <p>Software Eng.</p>
                  </div>
                </div>
                <div class="emp-item highlight">
                  <img src="https://ui-avatars.com/api/?name=Priya+S&background=E0E5FF&color=4318FF" class="avatar" />
                  <div class="emp-info">
                    <h4>Priya S</h4>
                    <p>HR Executive</p>
                  </div>
                </div>
                <div class="emp-item">
                  <img src="https://ui-avatars.com/api/?name=John+Doe&background=E0E5FF&color=4318FF" class="avatar" />
                  <div class="emp-info">
                    <h4>John Doe</h4>
                    <p>Sales Rep.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BOTTOM LEFT: ATTENDANCE -->
          <div class="card card-attendance">
            <div class="card-header">
              <h2>Daily Attendance</h2>
            </div>
            <div class="card-body centered">
              <div class="attendance-big-pie">
                <div class="pie-center">
                  <span>92%</span>
                  <small>Present</small>
                </div>
              </div>
              <div class="attendance-labels">
                <div><span class="dot green"></span> 104 Present</div>
                <div><span class="dot red"></span> 8 Absent</div>
              </div>
            </div>
          </div>

          <!-- BOTTOM MIDDLE: EMPLOYEE REQUESTS -->
          <div class="card card-requests">
            <div class="card-header">
              <h2>Leave Requests</h2>
              <span class="badge-count">4 New</span>
            </div>
            <div class="card-body">
              <div class="request-list">
                <div class="req-item">
                  <div class="req-details">
                    <h4>Sick Leave</h4>
                    <p>Sarah J. (2 Days)</p>
                  </div>
                  <div class="req-actions">
                    <button class="btn-icon green"><i data-lucide="check-circle"></i></button>
                    <button class="btn-icon red"><i data-lucide="x-circle"></i></button>
                  </div>
                </div>
                <div class="req-item">
                  <div class="req-details">
                    <h4>Casual Leave</h4>
                    <p>Mike T. (1 Day)</p>
                  </div>
                  <div class="req-actions">
                    <button class="btn-icon green"><i data-lucide="check-circle"></i></button>
                    <button class="btn-icon red"><i data-lucide="x-circle"></i></button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BOTTOM RIGHT: 3D PIE CHART -->
          <div class="card card-pie">
            <div class="card-header">
              <h2>Departments</h2>
            </div>
            <div class="card-body centered">
              <!-- Replaced 3D pie with a modern, colorful Donut chart -->
              <div class="colorful-donut">
                <div class="donut-segment s1"></div>
                <div class="donut-segment s2"></div>
                <div class="donut-segment s3"></div>
                <div class="donut-center">
                  <span>Dist.</span>
                </div>
              </div>
              <div class="legend-grid">
                <div><span class="dot blue"></span> IT (45%)</div>
                <div><span class="dot teal"></span> Sales (30%)</div>
                <div><span class="dot orange"></span> HR (25%)</div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  `;

  createIcons({
    icons: {
      LayoutDashboard, Users, Clock, CalendarRange, PieChart, Search, Bell, Menu, TrendingUp, UserCheck, MoreVertical, CheckCircle, XCircle
    }
  });
}
