import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, User, Search, Building2, Phone, Mail } from 'lucide-react';
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
      setEmployees(res.data || []);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Employees Directory
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage staff profiles, departmental allocations, and compensation contracts.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee ID</th>
              <th>Department</th>
              <th>Job Position</th>
              <th>Active Contract</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading employees...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr
                  key={emp.id}
                  onClick={() => navigate(`/employees/${emp.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="user-avatar" style={{ background: '#0f172a' }}>
                        {emp.firstName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{emp.workEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td><strong>{emp.employeeNum}</strong></td>
                  <td>{emp.department?.name || '—'}</td>
                  <td>{emp.jobPosition?.title || '—'}</td>
                  <td>
                    {emp.contracts?.[0] ? (
                      <span>₹{Number(emp.contracts[0].wage).toLocaleString()}/mo</span>
                    ) : (
                      <span style={{ color: '#94a3b8' }}>None</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${emp.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {emp.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <AddEmployeeModal
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
