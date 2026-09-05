import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { Plus, UserPlus } from 'lucide-react';
import { AddEmployeeModal } from '../../components/modals/AddEmployeeModal';

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const searchQuery = searchParams.get('search') || '';

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/employees?search=${encodeURIComponent(searchQuery)}`);
      const list = res.data?.employees || res.data || [];
      setEmployees(list);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, [searchQuery]);

  return (
    <div>
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Employee Directory ({employees.length})
          </h2>
          <button
            className="btn-pill-primary"
            id="btn-add-emp-header"
            onClick={() => setShowModal(true)}
          >
            <UserPlus size={16} />
            <span>Add Employee</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Emp #</th>
                <th style={{ padding: '0.85rem 1rem' }}>Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Work Email</th>
                <th style={{ padding: '0.85rem 1rem' }}>Department</th>
                <th style={{ padding: '0.85rem 1rem' }}>Designation</th>
                <th style={{ padding: '0.85rem 1rem' }}>Bank Masked</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading employee records from PostgreSQL...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No employee records found in PostgreSQL.
                  </td>
                </tr>
              ) : (
                employees.map((e) => (
                  <tr
                    key={e.id}
                    className="clickable-row"
                    onClick={() => navigate(`/employees/${e.id}`)}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      <span style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                        {e.employeeNum}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 600 }}>
                        {e.firstName} {e.lastName}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{e.workEmail}</td>
                    <td style={{ padding: '1rem' }}>{e.department?.name || '—'}</td>
                    <td style={{ padding: '1rem' }}>{e.jobPosition?.title || e.jobTitle || '—'}</td>
                    <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                      {e.bankAccountMasked || '••••••••'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${e.isActive ? 'green' : 'red'}`}>
                        {e.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <AddEmployeeModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            loadEmployees();
          }}
        />
      )}
    </div>
  );
}
