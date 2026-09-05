const app = document.getElementById('app');

if (app) {
  app.innerHTML = `
    <div class="app-container">
      <aside class="sidebar">
        <div class="brand">
          <span class="brand-badge">360</span>
          <span>PeoplePay360</span>
        </div>
        <ul class="nav-list">
          <li class="nav-item active"><a href="#dashboard">📊 Dashboard</a></li>
          <li class="nav-item"><a href="#employees">👥 Employees</a></li>
          <li class="nav-item"><a href="#contracts">📑 Contracts</a></li>
          <li class="nav-item"><a href="#attendance">⏱️ Attendance</a></li>
          <li class="nav-item"><a href="#timeoff">🌴 Time Off</a></li>
          <li class="nav-item"><a href="#payroll">💰 Payroll & Payruns</a></li>
          <li class="nav-item"><a href="#reports">📈 Reports & Audit</a></li>
        </ul>
      </aside>

      <main class="main-layout">
        <header class="topbar">
          <h1 class="page-title">HR & Payroll Overview</h1>
          <div class="user-badge">
            <div class="avatar">AD</div>
            <span>Admin</span>
          </div>
        </header>

        <section class="content-area">
          <div class="dashboard-grid">
            <div class="card">
              <span class="stat-label">Active Employees</span>
              <div class="stat-value">148</div>
            </div>
            <div class="card">
              <span class="stat-label">Active Contracts</span>
              <div class="stat-value">142</div>
            </div>
            <div class="card">
              <span class="stat-label">Pending Time-Off</span>
              <div class="stat-value">6</div>
            </div>
            <div class="card">
              <span class="stat-label">Current Payrun Status</span>
              <div class="stat-value" style="color: #10b981;">Draft</div>
            </div>
          </div>

          <div class="card" style="margin-top: 2rem;">
            <h3>Quick Actions</h3>
            <div style="display: flex; gap: 1rem; margin-top: 1rem;">
              <button class="btn btn-primary" id="btn-health">Check Backend Health</button>
            </div>
            <div id="health-output" style="margin-top: 1rem; font-family: monospace; font-size: 0.875rem; color: #9ca3af;"></div>
          </div>
        </section>
      </main>
    </div>
  `;

  const btnHealth = document.getElementById('btn-health');
  const output = document.getElementById('health-output');

  if (btnHealth && output) {
    btnHealth.addEventListener('click', async () => {
      output.innerText = 'Checking backend health...';
      try {
        const res = await fetch('/api/v1/health/readiness');
        const data = await res.json();
        output.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        output.innerText = 'Backend offline or connection failed.';
      }
    });
  }
}
