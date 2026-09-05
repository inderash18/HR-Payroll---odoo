import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Building } from 'lucide-react';

export function DepartmentDistribution({ departments = [] }) {
  const navigate = useNavigate();

  const getStatusChipClass = (status) => {
    switch (status) {
      case 'Healthy':
        return 'status-chip status-healthy';
      case 'Needs Attention':
        return 'status-chip status-warning';
      case 'Critical':
        return 'status-chip status-critical';
      default:
        return 'status-chip status-healthy';
    }
  };

  return (
    <div className="admin-card-white" id="admin-department-distribution-card">
      <div className="admin-card-header">
        <div>
          <h2 className="admin-card-title">Department Distribution</h2>
          <p className="admin-card-sub">Headcount allocation, attendance health, and operational readiness</p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/departments')}
          className="btn-secondary-clean"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.74rem' }}
        >
          <span>All Departments</span>
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table-clean">
          <thead>
            <tr>
              <th>Department</th>
              <th style={{ textAlign: 'center' }}>Employees</th>
              <th style={{ textAlign: 'center' }}>Attendance</th>
              <th style={{ textAlign: 'right' }}>Health Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr
                key={dept.id || dept.name}
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/employees?department=${encodeURIComponent(dept.name)}`)}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '0.5rem',
                        background: '#f1f5f9',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#0f172a',
                      }}
                    >
                      <Building size={14} />
                    </div>
                    <strong style={{ color: '#0f172a' }}>{dept.name}</strong>
                  </div>
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>{dept.employees}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 700 }}>{dept.attendance}%</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className={getStatusChipClass(dept.status)}>
                    ● {dept.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
