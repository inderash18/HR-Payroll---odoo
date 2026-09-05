import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Plus, ShieldCheck, ChevronRight, Code, Users, Landmark, Briefcase } from 'lucide-react';
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';

export function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(1);

  const loadData = async () => {
    try {
      const [dashRes, empRes, deptRes, leaveRes] = await Promise.allSettled([
        api.get('/dashboard/overview'),
        api.get('/employees'),
        api.get('/departments'),
        api.get('/leaves'),
      ]);

      if (dashRes.status === 'fulfilled') setData(dashRes.value.data);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data?.employees || empRes.value.data || []);
      if (deptRes.status === 'fulfilled') setDepartments(deptRes.value.data?.departments || deptRes.value.data || []);
      if (leaveRes.status === 'fulfilled') setLeaves(leaveRes.value.data?.leaves || leaveRes.value.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const defaultRoster = [
    { name: 'Sneha Iyer', role: 'Team Member', dept: 'Operations & Service Delivery', salary: '₹68,000 / mo', initial: 'SI' },
    { name: 'Rahul Verma', role: 'Team Member', dept: 'Finance & Indian Payroll', salary: '₹72,000 / mo', initial: 'RV' },
    { name: 'Priya Patel', role: 'Team Member', dept: 'Human Resources & Talent', salary: '₹65,000 / mo', initial: 'PP' },
    { name: 'Aarav Sharma', role: 'Team Member', dept: 'Engineering & Technology', salary: '₹85,000 / mo', initial: 'AS' },
  ];

  const displayEmployees = employees.length > 0
    ? employees.slice(0, 4).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        role: e.jobTitle || 'Team Member',
        dept: e.department?.name || 'Operations & Service Delivery',
        salary: e.contracts?.[0]?.wage
          ? `₹${Number(e.contracts[0].wage).toLocaleString('en-IN')} / mo`
          : '₹68,000 / mo',
        initial: `${e.firstName[0]}${e.lastName ? e.lastName[0] : ''}`.toUpperCase(),
      }))
    : defaultRoster;

  const defaultDepts = [
    { name: 'Engineering & Technology', count: '1 Members', icon: Code },
    { name: 'Finance & Indian Payroll', count: '1 Members', icon: Users },
    { name: 'Human Resources & Talent', count: '1 Members', icon: Landmark },
    { name: 'Operations & Service Delivery', count: '1 Members', icon: Briefcase },
  ];

  const deptList = departments.length >= 4
    ? departments.slice(0, 4).map((d, i) => ({
        id: d.id,
        name: d.name,
        count: `${d._count?.employees || d.employeeCount || 1} Members`,
        icon: defaultDepts[i % defaultDepts.length].icon,
      }))
    : defaultDepts;

  const featuredName = displayEmployees[0]?.name || 'Sneha Iyer';
  const featuredDept = displayEmployees[0]?.dept || 'Operations & Service Delivery';
  const pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;
  const attendanceRate = 98.4;

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-muted)' }}>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div className="ref-dashboard-grid">
        {/* LEFT COLUMN: WORKFORCE & SHIFTS */}
        <div className="ref-left-column">
          {/* TOP SECTION: WORKFORCE DIRECTORY */}
          <div>
            <div className="ref-section-header">
              <div>
                <h2 className="ref-section-title">Workforce Directory</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Active employees and contracted personnel
                </p>
              </div>
              <button
                className="ref-dropdown-pill"
                id="btn-quick-add-emp"
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  borderColor: 'var(--primary)',
                  padding: '0.45rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={14} color="#ffffff" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="ref-roster-list">
              {displayEmployees.map((emp, index) => (
                <div
                  key={emp.id || index}
                  className="ref-roster-row"
                  onClick={() => (emp.id ? navigate(`/employees/${emp.id}`) : navigate('/employees'))}
                >
                  <div className="ref-roster-user">
                    <div className="ref-roster-avatar-badge">{emp.initial}</div>
                    <div>
                      <div className="ref-roster-name">{emp.name}</div>
                      <div className="ref-roster-sub">
                        {emp.role} • {emp.dept}
                      </div>
                    </div>
                  </div>
                  <div className="ref-roster-meta" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {emp.salary}
                  </div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: '#ecfdf5',
                      color: '#047857',
                    }}
                  >
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM SECTION: SHIFTS & SCHEDULES */}
          <div style={{ marginTop: '1.75rem' }}>
            <div className="ref-section-header">
              <div>
                <h2 className="ref-section-title">Work Schedules & Shifts</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Active weekly operational coverage (IST)
                </p>
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {formattedDate}
              </span>
            </div>

            <div className="ref-schedule-container">
              {/* ON-DUTY SHIFT SUPERVISOR */}
              <div className="ref-schedule-featured">
                <div className="ref-featured-badge">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="ref-featured-name">{featuredName}</div>
                  <div className="ref-featured-desc">
                    Shift Supervisor
                    <br />
                    {featuredDept}
                  </div>
                </div>
                <button
                  className="ref-btn-black"
                  id="btn-view-attendance-tab"
                  onClick={() => navigate('/attendance')}
                >
                  Clock-In Log
                </button>
              </div>

              {/* DATE SLOTS */}
              <div className="ref-date-slots">
                <div
                  className={`ref-date-card ${activeDateIndex === 0 ? 'active' : ''}`}
                  onClick={() => setActiveDateIndex(0)}
                >
                  <div className="ref-date-left">
                    <span className="ref-date-num">{now.getDate()}</span>
                    <div className="ref-date-info">
                      <strong className="ref-date-month">{now.toLocaleString('default', { month: 'short' })}</strong>
                      <span className="ref-date-label">Today's Shift</span>
                    </div>
                  </div>
                  <div className="ref-time-badge">09:30 AM - 06:30 PM</div>
                </div>

                <div
                  className={`ref-date-card ${activeDateIndex === 1 ? 'active' : ''}`}
                  onClick={() => setActiveDateIndex(1)}
                >
                  <div className="ref-date-left">
                    <span className="ref-date-num">{now.getDate() + 1}</span>
                    <div className="ref-date-info">
                      <strong className="ref-date-month">{now.toLocaleString('default', { month: 'short' })}</strong>
                      <span className="ref-date-label">Tomorrow</span>
                    </div>
                  </div>
                  <div className="ref-time-badge">09:30 AM - 06:30 PM</div>
                </div>

                <div
                  className={`ref-date-card ${activeDateIndex === 2 ? 'active' : ''}`}
                  onClick={() => setActiveDateIndex(2)}
                >
                  <div className="ref-date-left">
                    <span className="ref-date-num">{now.getDate() + 2}</span>
                    <div className="ref-date-info">
                      <strong className="ref-date-month">{now.toLocaleString('default', { month: 'short' })}</strong>
                      <span className="ref-date-label">Upcoming</span>
                    </div>
                  </div>
                  <div className="ref-time-badge">09:30 AM - 06:30 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT ASIDE PANEL: DEPARTMENTS & HEALTH */}
        <aside className="ref-aside-panel">
          <div className="ref-aside-card">
            <h3 className="ref-aside-title">Departments</h3>
            <div className="ref-course-list">
              {deptList.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.id || i}
                    className="ref-course-item"
                    onClick={() => navigate('/departments')}
                  >
                    <div className="ref-course-left">
                      <div className="ref-course-icon">
                        <Icon size={16} />
                      </div>
                      <div className="ref-course-text">
                        <div className="ref-course-title">{c.name}</div>
                        <div className="ref-course-sub">{c.count}</div>
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ref-aside-card">
            <h3 className="ref-aside-title">Attendance & Compliance</h3>

            <div className="ref-radial-meter">
              <div className="ref-radial-circle">
                <svg width="140" height="140" viewBox="0 0 150 150">
                  <circle
                    cx="75"
                    cy="75"
                    r="58"
                    fill="none"
                    stroke="#0d0f12"
                    strokeWidth="11"
                    strokeDasharray="4 6"
                    strokeLinecap="round"
                    transform="rotate(-90 75 75)"
                  />
                </svg>
                <div className="ref-radial-pct">{attendanceRate}%</div>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'var(--text-secondary)',
                  marginBottom: '0.45rem',
                }}
              >
                <span>{pendingLeavesCount > 0 ? `${pendingLeavesCount} Leaves Pending` : 'System Status'}</span>
                <span style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>● Online</span>
              </div>
              <div className="ref-progress-track">
                <div className="ref-progress-fill" style={{ width: `${attendanceRate}%` }}></div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
