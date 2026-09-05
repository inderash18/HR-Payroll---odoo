import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Plus, Calendar, Check, X, UserPlus, Clock } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';

export function LeavesPage() {
  const [requests, setRequests] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Auth
  const { user, hasRole } = useAuth();
  const canAllocate = hasRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'HR_MANAGER');

  // Modals
  const [showReqModal, setShowReqModal] = useState(false);
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form states
  const [reqForm, setReqForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    numberOfDays: 1,
    reason: '',
  });

  const [allocForm, setAllocForm] = useState({
    employeeId: '',
    leaveTypeId: '',
    allocatedAmount: 18,
    validFrom: `${new Date().getFullYear()}-01-01`,
    validUntil: `${new Date().getFullYear()}-12-31`,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [reqRes, typeRes, empRes] = await Promise.allSettled([
        api.get('/leaves/requests'),
        api.get('/leaves/types'),
        api.get('/employees'),
      ]);

      if (reqRes.status === 'fulfilled') setRequests(reqRes.value.data?.requests || reqRes.value.data || []);
      if (typeRes.status === 'fulfilled') setLeaveTypes(typeRes.value.data?.leaveTypes || typeRes.value.data || []);
      if (empRes.status === 'fulfilled') setEmployees(empRes.value.data?.employees || empRes.value.data || []);
    } catch (err) {
      console.error('Failed to load leaves data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.patch(`/leaves/requests/${id}/approve`);
      setToastMessage('Leave request approved');
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.patch(`/leaves/requests/${id}/reject`, { rejectionReason: 'Rejected by administrator' });
      setToastMessage('Leave request rejected');
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Rejection failed');
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post('/leaves/requests', {
        ...reqForm,
        employeeId: canAllocate ? reqForm.employeeId : user?.employee?.id,
        numberOfDays: Number(reqForm.numberOfDays),
      });
      setShowReqModal(false);
      setReqForm({
        employeeId: '',
        leaveTypeId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        numberOfDays: 1,
        reason: '',
      });
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAlloc = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post('/leaves/allocations', {
        ...allocForm,
        allocatedAmount: Number(allocForm.allocatedAmount),
        status: 'APPROVED',
      });
      setShowAllocModal(false);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to allocate leave');
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
            Leaves & Time Off Administration
          </h2>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {canAllocate && (
              <button
                className="btn-pill-secondary"
                id="btn-allocate-leave"
                onClick={() => setShowAllocModal(true)}
              >
                <Plus size={16} />
                <span>Allocate Days</span>
              </button>
            )}
            <button
              className="btn-pill-primary"
              id="btn-request-leave"
              onClick={() => setShowReqModal(true)}
            >
              <Plus size={16} />
              <span>Request Time Off</span>
            </button>
          </div>
        </div>

        {errorMessage && !showReqModal && !showAllocModal && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', marginTop: '1rem' }}>
            {errorMessage}
          </div>
        )}

        {toastMessage && (
          <div id="toast-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
            <div className="toast" style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <Check size={16} color="#16a34a" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Leave Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Duration</th>
                <th style={{ padding: '0.85rem 1rem' }}>Days</th>
                <th style={{ padding: '0.85rem 1rem' }}>Reason</th>
                <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading leave requests from PostgreSQL...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No time off requests found.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      {r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Current Employee'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge blue">{r.leaveType?.name || 'Paid Annual Leave'}</span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {new Date(r.startDate).toLocaleDateString()} &rarr; {new Date(r.endDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 700 }}>{r.numberOfDays} days</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {r.reason || '—'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span
                        className={`badge ${
                          r.status === 'APPROVED' ? 'green' : r.status === 'REJECTED' ? 'red' : 'orange'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button
                            className="btn-pill-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: 'var(--green)' }}
                            onClick={() => handleApprove(r.id)}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button
                            className="btn-pill-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', color: 'var(--red)' }}
                            onClick={() => handleReject(r.id)}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Leave Modal */}
      {showReqModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Submit Time Off Request</h3>
              <button className="modal-close-btn" onClick={() => { setShowReqModal(false); setErrorMessage(null); }}>
                &times;
              </button>
            </div>
            {errorMessage && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', marginTop: '1rem' }}>
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleCreateRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {canAllocate && (
                  <div className="modal-form-group">
                    <label>Employee</label>
                    <select
                      required
                      value={reqForm.employeeId}
                      onChange={(e) => setReqForm({ ...reqForm, employeeId: e.target.value })}
                    >
                      <option value="">Select Employee...</option>
                      {employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.firstName} {e.lastName} ({e.employeeNum})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="modal-form-group">
                  <label>Leave Type</label>
                  <select
                    required
                    value={reqForm.leaveTypeId}
                    onChange={(e) => setReqForm({ ...reqForm, leaveTypeId: e.target.value })}
                  >
                    <option value="">Select Type...</option>
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    required
                    value={reqForm.startDate}
                    onChange={(e) => setReqForm({ ...reqForm, startDate: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    required
                    value={reqForm.endDate}
                    onChange={(e) => setReqForm({ ...reqForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label>Number of Days</label>
                <input
                  type="number"
                  required
                  min="0.5"
                  step="0.5"
                  value={reqForm.numberOfDays}
                  onChange={(e) => setReqForm({ ...reqForm, numberOfDays: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label>Reason / Notes (Optional)</label>
                <textarea
                  placeholder="Personal appointment / medical leave..."
                  value={reqForm.reason}
                  onChange={(e) => setReqForm({ ...reqForm, reason: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-pill-secondary"
                  onClick={() => setShowReqModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting in PostgreSQL...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Days Modal */}
      {showAllocModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Allocate Annual Leave Days</h3>
              <button className="modal-close-btn" onClick={() => { setShowAllocModal(false); setErrorMessage(null); }}>
                &times;
              </button>
            </div>
            {errorMessage && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem', marginTop: '1rem' }}>
                {errorMessage}
              </div>
            )}
            <form onSubmit={handleCreateAlloc}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Employee</label>
                  <select
                    required
                    value={allocForm.employeeId}
                    onChange={(e) => setAllocForm({ ...allocForm, employeeId: e.target.value })}
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
                  <label>Leave Type</label>
                  <select
                    required
                    value={allocForm.leaveTypeId}
                    onChange={(e) => setAllocForm({ ...allocForm, leaveTypeId: e.target.value })}
                  >
                    <option value="">Select Type...</option>
                    {leaveTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-form-group">
                <label>Number of Days Allocated</label>
                <input
                  type="number"
                  required
                  value={allocForm.allocatedAmount}
                  onChange={(e) => setAllocForm({ ...allocForm, allocatedAmount: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Valid From</label>
                  <input
                    type="date"
                    required
                    value={allocForm.validFrom}
                    onChange={(e) => setAllocForm({ ...allocForm, validFrom: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Valid Until</label>
                  <input
                    type="date"
                    required
                    value={allocForm.validUntil}
                    onChange={(e) => setAllocForm({ ...allocForm, validUntil: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-pill-secondary"
                  onClick={() => setShowAllocModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Allocating...' : 'Confirm Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
