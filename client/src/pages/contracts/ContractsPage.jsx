import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Plus, FileText, Calendar, DollarSign, CheckCircle2 } from 'lucide-react';

export function ContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [structures, setStructures] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    structureId: '',
    wage: '',
    wagePeriod: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    scheduleId: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cntRes, empRes, structRes, schRes] = await Promise.allSettled([
        api.get('/contracts'),
        api.get('/employees'),
        api.get('/payroll/structures'),
        api.get('/schedules'),
      ]);

      if (cntRes.status === 'fulfilled') setContracts(cntRes.value.data?.contracts || cntRes.value.data || []);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data?.employees || empRes.value.data || []);
      if (structRes.status === 'fulfilled') setStructures(structRes.value.data?.structures || structRes.value.data || []);
      if (schRes.status === 'fulfilled') setSchedules(schRes.value.data?.schedules || schRes.value.data || []);
    } catch (err) {
      console.error('Failed to load contracts data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post('/contracts', {
        ...formData,
        wage: Number(formData.wage),
        status: 'ACTIVE',
      });
      setShowModal(false);
      setFormData({
        name: '',
        employeeId: '',
        structureId: '',
        wage: '',
        wagePeriod: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        scheduleId: '',
      });
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to create contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Employment Contracts ({contracts.length})
          </h2>
          <button
            className="btn-pill-primary"
            id="btn-add-contract-header"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>New Contract</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Contract Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Base Wage</th>
                <th style={{ padding: '0.85rem 1rem' }}>Salary Structure</th>
                <th style={{ padding: '0.85rem 1rem' }}>Period</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading contract records from PostgreSQL...
                  </td>
                </tr>
              ) : contracts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No contracts found in PostgreSQL.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.id}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '1rem' }}>
                      {c.employee ? (
                        <Link
                          to={`/employees/${c.employee.id}`}
                          style={{ color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          {c.employee.firstName} {c.employee.lastName} ({c.employee.employeeNum})
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      ₹{Number(c.wage || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / {c.wagePeriod || 'MONTHLY'}
                    </td>
                    <td style={{ padding: '1rem' }}>{c.structure?.name || 'Indian Standard Payroll Structure'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(c.startDate).toLocaleDateString()} &rarr;{' '}
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Open-ended'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'green' : 'orange'}`}>
                        {c.status}
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
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Create Compensation Contract</h3>
              <button className="modal-close-btn" onClick={() => { setShowModal(false); setErrorMessage(null); }}>
                &times;
              </button>
            </div>

            {errorMessage && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', marginTop: '1rem' }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="modal-form-group">
                <label>Contract Name</label>
                <input
                  type="text"
                  required
                  placeholder="Software Engineer Level 2 Contract"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Employee</label>
                  <select
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.firstName} {e.lastName} ({e.employeeNum})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Salary Structure</label>
                  <select
                    required
                    value={formData.structureId}
                    onChange={(e) => setFormData({ ...formData, structureId: e.target.value })}
                  >
                    <option value="">Select Structure...</option>
                    {structures.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                    {structures.length === 0 && (
                      <option value="default-structure">Indian Standard Payroll Structure (IND-STD-01)</option>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Base Wage (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="75000"
                    value={formData.wage}
                    onChange={(e) => setFormData({ ...formData, wage: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Wage Period</label>
                  <select
                    value={formData.wagePeriod}
                    onChange={(e) => setFormData({ ...formData, wagePeriod: e.target.value })}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="HOURLY">Hourly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="modal-form-group">
                  <label>Working Schedule</label>
                  <select
                    value={formData.scheduleId}
                    onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                  >
                    <option value="">Standard 40h/week (IST)</option>
                    {schedules.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-pill-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating in PostgreSQL...' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
