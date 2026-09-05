import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';

export function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employeeNum: `EMP-${Math.floor(10000 + Math.random() * 90000)}`,
    workEmail: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    workingScheduleId: '',
    bankAccountMasked: '••••••••9842',
    jobTitle: '',
  });

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [deptRes, schRes] = await Promise.all([
          api.get('/departments').catch(() => ({ data: [] })),
          api.get('/schedules').catch(() => ({ data: [] })),
        ]);
        setDepartments(deptRes.data?.departments || deptRes.data || []);
        setSchedules(schRes.data?.schedules || schRes.data || []);
      } catch (err) {
        console.error('Failed to load modal options:', err);
      }
    }
    loadDropdowns();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/employees', {
        employeeNum: formData.employeeNum,
        workEmail: formData.workEmail,
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId || undefined,
        workingScheduleId: formData.workingScheduleId || undefined,
        bankAccountMasked: formData.bankAccountMasked || undefined,
        jobTitle: formData.jobTitle || undefined,
      });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to save employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Create New Employee</h3>
          <button className="modal-close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label>Employee Number</label>
              <input
                type="text"
                required
                placeholder="EMP-00105"
                value={formData.employeeNum}
                onChange={(e) => setFormData({ ...formData, employeeNum: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Work Email</label>
              <input
                type="email"
                required
                placeholder="aarav.sharma@peoplepay360.local"
                value={formData.workEmail}
                onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label>First Name</label>
              <input
                type="text"
                required
                placeholder="Aarav"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="modal-form-group">
              <label>Last Name</label>
              <input
                type="text"
                required
                placeholder="Sharma"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label>Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form-group">
              <label>Working Schedule</label>
              <select
                value={formData.workingScheduleId}
                onChange={(e) => setFormData({ ...formData, workingScheduleId: e.target.value })}
              >
                <option value="">Select Schedule...</option>
                {schedules.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label>Bank Account Number (Masked preview)</label>
            <input
              type="text"
              placeholder="••••••••9842"
              value={formData.bankAccountMasked}
              onChange={(e) => setFormData({ ...formData, bankAccountMasked: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-pill-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pill-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving to PostgreSQL...' : 'Save Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
