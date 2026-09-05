import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Check, X, Calendar } from 'lucide-react';

export function LeavesPage() {
  const { hasRole } = useAuth();
  const [requests, setRequests] = useState([]);
  const [types, setTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    numberOfDays: 1,
    reason: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [rRes, tRes, eRes] = await Promise.all([
        api.get('/leaves/requests'),
        api.get('/leaves/types'),
        api.get('/employees'),
      ]);
      setRequests(rRes.data || []);
      setTypes(tRes.data || []);
      setEmployees(eRes.data || []);
    } catch (err) {
      console.error('Failed to load leave data:', err);
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
      await api.post('/leaves/requests', {
        ...formData,
        numberOfDays: Number(formData.numberOfDays),
      });
      setShowModal(false);
      setFormData({ employeeId: '', leaveTypeId: '', startDate: '', endDate: '', numberOfDays: 1, reason: '' });
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to submit leave request');
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/leaves/requests/${id}/approve`);
      loadData();
    } catch (err) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(`/leaves/requests/${id}/reject`);
      loadData();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const canApprove = hasRole('ADMIN', 'HR_MANAGER');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Leaves & Time-Off Management
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Request vacation, medical, and casual leaves with automated balance accounting.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Request Time-Off
        </button>
      </div>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Duration</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              {canApprove && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No leave requests found.</td></tr>
            ) : (
              requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.employee?.firstName} {r.employee?.lastName}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{r.employee?.employeeNum}</div>
                  </td>
                  <td>{r.leaveType?.name || 'General'}</td>
                  <td>
                    {new Date(r.startDate).toLocaleDateString()} — {new Date(r.endDate).toLocaleDateString()}
                  </td>
                  <td><strong>{Number(r.numberOfDays)} d</strong></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.reason || '—'}
                  </td>
                  <td>
                    <span className={`badge badge-${r.status === 'APPROVED' ? 'success' : r.status === 'PENDING_APPROVAL' ? 'warning' : 'danger'}`}>
                      {r.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td>
                      {r.status === 'PENDING_APPROVAL' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => handleApprove(r.id)}
                            title="Approve"
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={() => handleReject(r.id)}
                            title="Reject"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Processed</span>
                      )}
                    </td>
                  )}
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
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Submit Time-Off Request</h2>
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
                      <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeNum})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Leave Policy</label>
                  <select
                    className="form-select"
                    required
                    value={formData.leaveTypeId}
                    onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  >
                    <option value="">Select Policy</option>
                    {types.map((t) => (
                      <option key={t.id} value={t.id}>{t.name} ({t.daysAllowed} days/yr)</option>
                    ))}
                  </select>
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
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Number of Days</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    className="form-input"
                    required
                    value={formData.numberOfDays}
                    onChange={(e) => setFormData({ ...formData, numberOfDays: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Notes</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Brief explanation for time-off..."
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
