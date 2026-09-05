import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Plus, Landmark, CheckCircle2, Play, Check, DollarSign } from 'lucide-react';

export function PayrollPage() {
  const [payruns, setPayruns] = useState([]);
  const [structures, setStructures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
    structureId: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prRes, stRes] = await Promise.allSettled([
        api.get('/payroll/payruns'),
        api.get('/payroll/structures'),
      ]);

      if (prRes.status === 'fulfilled') setPayruns(prRes.value.data?.payruns || prRes.value.data || []);
      if (stRes.status === 'fulfilled') setStructures(stRes.value.data?.structures || stRes.value.data || []);
    } catch (err) {
      console.error('Failed to load payroll:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCompute = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/payroll/payruns/${id}/compute`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Compute failed');
    }
  };

  const handleValidate = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/payroll/payruns/${id}/validate`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Validate failed');
    }
  };

  const handlePay = async (id, e) => {
    e.stopPropagation();
    try {
      await api.post(`/payroll/payruns/${id}/pay`, { paymentMethod: 'BANK_TRANSFER' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Payment mark failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/payroll/payruns', {
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        structureId: formData.structureId || undefined,
      });
      setShowModal(false);
      setFormData({
        name: '',
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
        structureId: '',
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create payrun');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Payroll Payrun Batches ({payruns.length})
          </h2>
          <button
            className="btn-pill-primary"
            id="btn-create-payrun"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Generate Payrun Batch</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Batch Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Period</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Gross</th>
                <th style={{ padding: '0.85rem 1rem' }}>Total Net</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading payrun batches from PostgreSQL...
                  </td>
                </tr>
              ) : payruns.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No payrun batches found.
                  </td>
                </tr>
              ) : (
                payruns.map((p) => (
                  <tr
                    key={p.id}
                    className="clickable-row"
                    onClick={() => navigate(`/payroll/payruns/${p.id}`)}
                  >
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      <Link
                        to={`/payroll/payruns/${p.id}`}
                        style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(p.startDate).toLocaleDateString()} &rarr; {new Date(p.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      ₹{Number(p.totalGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--green-text)' }}>
                      ₹{Number(p.totalNet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        className={`badge ${
                          p.status === 'PAID'
                            ? 'green'
                            : p.status === 'VALIDATED'
                            ? 'blue'
                            : p.status === 'COMPUTED'
                            ? 'orange'
                            : 'neutral'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      {p.status === 'DRAFT' && (
                        <button
                          className="btn-pill-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                          onClick={(e) => handleCompute(p.id, e)}
                        >
                          Compute
                        </button>
                      )}
                      {p.status === 'COMPUTED' && (
                        <button
                          className="btn-pill-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'var(--blue)' }}
                          onClick={(e) => handleValidate(p.id, e)}
                        >
                          Validate
                        </button>
                      )}
                      {p.status === 'VALIDATED' && (
                        <button
                          className="btn-pill-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'var(--green)' }}
                          onClick={(e) => handlePay(p.id, e)}
                        >
                          Mark Paid
                        </button>
                      )}
                      {p.status === 'PAID' && (
                        <span style={{ color: 'var(--green-text)', fontWeight: 600, fontSize: '0.82rem' }}>
                          ✓ Disbursed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Salary Structures ({structures.length})
          </h2>
        </div>
        <div>
          {structures.map((st) => (
            <div
              key={st.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1rem',
                background: 'var(--bg-surface)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  {st.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({st.code})</span>
                </h4>
                <span className="badge green">ACTIVE</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Rules count: {st.rules?.length || 0} salary rules in execution sequence
              </p>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Create New Payrun Batch</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-form-group">
                <label>Payrun Batch Name</label>
                <input
                  type="text"
                  required
                  placeholder="Payroll - September 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Period Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Period End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Salary Structure (Optional filter)</label>
                <select
                  value={formData.structureId}
                  onChange={(e) => setFormData({ ...formData, structureId: e.target.value })}
                >
                  <option value="">All active employee structures</option>
                  {structures.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
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
                  {isSubmitting ? 'Creating in PostgreSQL...' : 'Create Payrun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
