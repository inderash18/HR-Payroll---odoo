import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus,
  ShieldCheck,
  ChevronRight,
  Code,
  Users,
  Landmark,
  Briefcase,
  User,
  Settings,
  KeyRound,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDateIndex, setActiveDateIndex] = useState(1);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

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

  // Handle outside click for dashboard profile dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const defaultRoster = [
    { id: 'emp-sneha', name: 'Sneha Iyer', role: 'Shift Supervisor', dept: 'Operations & Service Delivery', salary: '₹68,000 / mo', initial: 'SI' },
    { id: 'emp-rahul', name: 'Rahul Verma', role: 'Team Member', dept: 'Finance & Indian Payroll', salary: '₹72,000 / mo', initial: 'RV' },
    { id: 'emp-priya', name: 'Priya Patel', role: 'Team Member', dept: 'Human Resources & Talent', salary: '₹65,000 / mo', initial: 'PP' },
    { id: 'emp-aarav', name: 'Aarav Sharma', role: 'Team Member', dept: 'Engineering & Technology', salary: '₹85,000 / mo', initial: 'AS' },
  ];

  const displayEmployees = employees.length > 0
    ? employees.slice(0, 4).map((e) => ({
        id: e.id,
        name: `${e.firstName} ${e.lastName}`,
        role: e.jobPosition?.title || e.jobTitle || 'Team Member',
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

  // Header and Supervisor values
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (displayEmployees[0]?.name || 'Sneha Iyer');
  const userRoleLabel = user?.role ? user.role.replace(/_/g, ' ') : 'Shift Supervisor';
  const userInitials = user?.firstName
    ? `${user.firstName[0]}${user.lastName ? user.lastName[0] : ''}`.toUpperCase()
    : 'SI';

  const featuredSupervisor = employees.find((e) => `${e.firstName} ${e.lastName}`.toLowerCase().includes('sneha')) || employees[0];
  const featuredSupervisorId = featuredSupervisor?.id || displayEmployees[0]?.id || 'emp-sneha';
  const featuredName = featuredSupervisor ? `${featuredSupervisor.firstName} ${featuredSupervisor.lastName}` : 'Sneha Iyer';
  const featuredDept = featuredSupervisor?.department?.name || 'Operations & Service Delivery';

  const pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;
  const attendanceRate = 98.4;

  const handleLogoutAction = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

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
                  cursor: 'pointer',
                }}
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={14} color="#ffffff" />
                <span>Add Employee</span>
              </button>
            </div>

            <div className="ref-roster-list">
              {displayEmployees.map((emp, index) => {
                const targetEmpId = emp.id || (employees[index]?.id || 'emp-details');
                return (
                  <div
                    key={emp.id || index}
                    className="ref-roster-row clickable-row"
                    id={`roster-row-${index}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/employees/${targetEmpId}`)}
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
                );
              })}
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
              <div
                className="ref-schedule-featured"
                id="card-shift-supervisor"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/employees/${featuredSupervisorId}`)}
              >
                <div className="ref-featured-badge">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="ref-featured-name" style={{ color: 'var(--text-main)', fontWeight: 800 }}>
                    {featuredName}
                  </div>
                  <div className="ref-featured-desc">
                    Shift Supervisor
                    <br />
                    {featuredDept}
                  </div>
                </div>
                <button
                  className="ref-btn-black"
                  id="btn-view-attendance-tab"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/profile/attendance');
                  }}
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

        {/* RIGHT ASIDE PANEL: PROFILE CONTROL, DEPARTMENTS & HEALTH */}
        <aside className="ref-aside-panel">
          {/* VISIBLE TOP-RIGHT PROFILE CONTROL */}
          <div
            className="dashboard-profile-box"
            ref={profileDropdownRef}
            style={{ position: 'relative', marginBottom: '1.25rem' }}
          >
            <div
              className="dashboard-profile-card-trigger"
              id="dashboard-user-profile-btn"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-pill)',
                padding: '0.45rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-subtle)',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    color: '#ffffff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    flexShrink: 0,
                  }}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt="Avatar"
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.2 }}>
                    {userName}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {userRoleLabel}
                  </span>
                </div>
              </div>
              <ChevronDown
                size={15}
                style={{
                  color: 'var(--text-muted)',
                  transform: profileDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
              />
            </div>

            {/* DASHBOARD PROFILE DROPDOWN MENU */}
            {profileDropdownOpen && (
              <div
                className="dashboard-profile-dropdown-menu"
                id="dashboard-profile-dropdown"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  left: 0,
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-modal)',
                  zIndex: 999,
                  padding: '0.5rem 0',
                  minWidth: '220px',
                }}
              >
                <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>{userName}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{userRoleLabel}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', padding: '0.35rem 0' }}>
                  <div
                    className="dropdown-nav-item"
                    id="dashboard-menu-my-profile"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile');
                    }}
                    style={{ padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
                  >
                    <User size={15} />
                    <span>My Profile</span>
                  </div>

                  <div
                    className="dropdown-nav-item"
                    id="dashboard-menu-account-settings"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile/settings');
                    }}
                    style={{ padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
                  >
                    <Settings size={15} />
                    <span>Account Settings</span>
                  </div>

                  <div
                    className="dropdown-nav-item"
                    id="dashboard-menu-change-password"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile/security');
                    }}
                    style={{ padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
                  >
                    <KeyRound size={15} />
                    <span>Change Password</span>
                  </div>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.35rem 0' }} />

                  <div
                    className="dropdown-nav-item logout-danger"
                    id="dashboard-menu-logout"
                    onClick={handleLogoutAction}
                    style={{ padding: '0.55rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--red-text)', cursor: 'pointer' }}
                  >
                    <LogOut size={15} />
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ref-aside-card">
            <h3 className="ref-aside-title">Departments</h3>
            <div className="ref-course-list">
              {deptList.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.id || i}
                    className="ref-course-item clickable-row"
                    id={`dept-item-${i}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => (c.id ? navigate(`/employees?departmentId=${c.id}`) : navigate('/departments'))}
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
