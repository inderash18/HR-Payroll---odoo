import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ChevronRight, Eye } from 'lucide-react';

export function RecentEmployeesTable({ employees = [] }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const formattedEmployees = useMemo(() => {
    return (employees || []).map((emp) => {
      const name = emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || 'Employee';
      const employeeId = emp.employeeId || emp.employeeNum || 'EMP-360';
      const department = emp.department?.name || emp.department || 'General';
      const jobTitle = emp.jobPosition?.title || emp.jobTitle || 'Team Member';
      const joiningDate = emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';
      const status = emp.status || (emp.isActive !== false ? 'Active' : 'Inactive');
      const avatarInitials = emp.avatarInitials || (name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'EM');

      return {
        id: emp.id,
        name,
        employeeId,
        department,
        jobTitle,
        joiningDate,
        status,
        avatarInitials,
        avatarBg: emp.avatarBg || '#0f172a',
      };
    });
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return formattedEmployees;
    const q = searchTerm.toLowerCase();
    return formattedEmployees.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q)
    );
  }, [formattedEmployees, searchTerm]);

  return (
    <div className="admin-card-white" id="admin-recent-employees-table-card">
      <div className="admin-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h2 className="admin-card-title">Recently Added Employees</h2>
          <p className="admin-card-sub">New joiners and talent onboarding pipeline</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '0.35rem 0.85rem',
              gap: '0.45rem',
            }}
          >
            <Search size={14} style={{ color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search recent employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.76rem',
                color: '#0f172a',
                width: '160px',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="btn-secondary-clean"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.74rem' }}
          >
            <span>View All Employees</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table-clean">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: emp.avatarBg || '#0f172a',
                          color: '#ffffff',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        {emp.avatarInitials}
                      </div>
                      <strong style={{ color: '#0f172a' }}>{emp.name}</strong>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#64748b' }}>
                    {emp.employeeId}
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '0.5rem',
                        background: '#f1f5f9',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        color: '#334155',
                      }}
                    >
                      {emp.department}
                    </span>
                  </td>
                  <td style={{ color: '#475569' }}>{emp.jobTitle}</td>
                  <td style={{ color: '#64748b' }}>{emp.joiningDate}</td>
                  <td>
                    <span
                      style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: emp.status === 'Active' ? '#ecfdf5' : '#eff6ff',
                        color: emp.status === 'Active' ? '#047857' : '#1d4ed8',
                        border: emp.status === 'Active' ? '1px solid #a7f3d0' : '1px solid #bfdbfe',
                      }}
                    >
                      ● {emp.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn-secondary-clean"
                      style={{ padding: '0.25rem 0.55rem', borderRadius: '0.45rem' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/employees/${emp.id}`);
                      }}
                    >
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  {searchTerm ? `No employees matching "${searchTerm}"` : 'No employees in database. Click "Add Employee" to onboard your team.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
