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
            {departments.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No departments found in the database.
                </td>
              </tr>
            ) : (
              departments.slice(0, 5).map((dept) => {
                const empCount = dept.employees ?? dept.employeeCount ?? dept._count?.employees ?? 0;
                const attRate = dept.attendance ?? 100;
                const status = dept.status || (attRate >= 90 ? 'Healthy' : 'Needs Attention');

                return (
                  <tr
                    key={dept.id || dept.name}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(dept.id ? `/employees?departmentId=${dept.id}` : '/departments')}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '0.5rem',
                            background: 'var(--surface-soft)',
                            display: 'grid',
                            placeItems: 'center',
                            color: 'var(--primary)',
                          }}
                        >
                          <Building size={14} />
                        </div>
                        <strong style={{ color: 'var(--text-primary)' }}>{dept.name}</strong>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 700 }}>{empCount}</td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700 }}>{attRate}%</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={getStatusChipClass(status)}>
                        ● {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {departments.length > 5 && (
        <div 
          style={{ 
            padding: '1rem', 
            textAlign: 'center', 
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
          onClick={() => navigate('/departments')}
          className="clickable-footer"
        >
          View all {departments.length} departments
        </div>
      )}
    </div>
  );
}
