import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useNavigate } from 'react-router-dom';
import { Plus, CircleDollarSign, Play, CheckCircle } from 'lucide-react';

export function PayrollPage() {
  const [payruns, setPayruns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: `Payroll Batch - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
  });

  const loadPayruns = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/payroll/payruns');
      setPayruns(res.data || []);
    } catch (err) {
      console.error('Failed to load payruns:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayruns();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/payroll/payruns', formData);
      setShowModal(false);
      loadPayruns();
      navigate(`/payroll/payruns/${res.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create payrun');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Payroll Execution & Batches
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Generate monthly salary batches, evaluate contract rules, and validate disbursements.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> New Payrun Batch
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Batch Name</th>
              <th>Pay Period</th>
              <th>Total Gross</th>
              <th>Total Net</th>
              <th>Payslips</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading payruns...</td></tr>
            ) : payruns.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No payruns created yet.</td></tr>
            ) : (
              payruns.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/payroll/payruns/${p.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <td><strong>{p.name}</strong></td>
                  <td>
                    {new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}
                  </td>
                  <td>₹{Number(p.totalGross).toLocaleString()}</td>
                  <td><strong style={{ color: '#10b981' }}>₹{Number(p.totalNet).toLocaleString()}</strong></td>
                  <td>{p._count?.payslips || 0} slips</td>
                  <td>
                    <span className={`badge badge-${p.status === 'PAID' ? 'success' : p.status === 'VALIDATED' ? 'info' : p.status === 'COMPUTED' ? 'warning' : 'neutral'}`}>
                      {p.status}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Create New Payrun Batch</h2>
            </div>
            {error && (
              <div style={{ margin: '20px 24px 0 24px', padding: '12px', background: 'var(--danger-bg)', color: 'var(--danger-text)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}>
                {error}
              </div>
            )}
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Batch Title</label>
                  <input
                    type="text"
                    className="form-input"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Period Start</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period End</label>
                    <input
                      type="date"
                      className="form-input"
                      required
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
                  Create Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
