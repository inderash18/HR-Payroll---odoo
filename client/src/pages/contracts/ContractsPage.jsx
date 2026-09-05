import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Plus, FileText } from 'lucide-react';

export function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    structureId: '',
    name: '',
    wage: '',
    startDate: '',
    endDate: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cRes, eRes, sRes] = await Promise.all([
        api.get('/contracts'),
        api.get('/employees'),
        api.get('/payroll/structures'),
      ]);
      setContracts(cRes.data || []);
      setEmployees(eRes.data || []);
      setStructures(sRes.data || []);
    } catch (err) {
      console.error('Failed to load contracts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/contracts', {
        ...formData,
        wage: Number(formData.wage),
        endDate: formData.endDate || null,
        status: 'ACTIVE',
      });
      setShowModal(false);
      setFormData({ employeeId: '', structureId: '', name: '', wage: '', startDate: '', endDate: '' });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to create contract');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Compensation Contracts
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active employment agreements and salary structure mappings.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Contract
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Contract Title</th>
              <th>Salary Structure</th>
              <th>Monthly Wage</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading contracts...</td></tr>
            ) : contracts.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No contracts found.</td></tr>
            ) : (
              contracts.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.employee?.firstName} {c.employee?.lastName}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{c.employee?.employeeNum}</div>
                  </td>
                  <td>{c.name}</td>
                  <td>{c.structure?.name || 'Standard'}</td>
                  <td><strong>₹{Number(c.wage).toLocaleString()}</strong></td>
                  <td>{new Date(c.startDate).toLocaleDateString()}</td>
                  <td>{c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Open-ended'}</td>
                  <td>
                    <span className={`badge badge-${c.status === 'ACTIVE' ? 'success' : 'neutral'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Create Employment Contract</h2>
            </div>
            {error && (
              <div style={{ margin: '20px 24px 0 24px', padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <select
                    className="form-select"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeNum})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Salary Structure</label>
                  <select
                    className="form-select"
                    required
                    value={formData.structureId}
                    onChange={(e) => setFormData({ ...formData, structureId: e.target.value })}
                  >
                    <option value="">Select Structure</option>
                    {structures.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Contract Title</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    placeholder="e.g. Senior Software Architect Contract"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Monthly Gross Wage (₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    placeholder="150000"
                    value={formData.wage}
                    onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date (Optional)</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Contract
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
