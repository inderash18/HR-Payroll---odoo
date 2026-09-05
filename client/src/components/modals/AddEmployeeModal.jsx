import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Building2, Briefcase, MapPin, Laptop, Calendar, CreditCard, User, Mail, Hash } from 'lucide-react';

export function AddEmployeeModal({ isOpen, onClose, onSuccess }) {
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [formData, setFormData] = useState({
    employeeNum: `PP360-${Math.floor(1000 + Math.random() * 9000)}`,
    workEmail: '',
    firstName: '',
    lastName: '',
    departmentId: '',
    workingScheduleId: '',
    jobTitle: 'Software Engineer',
    workMode: 'HYBRID',
    location: 'Coimbatore',
    employmentType: 'FULL_TIME',
    bankAccountMasked: '••••••••' + Math.floor(1000 + Math.random() * 9000),
  });

  const extractList = (res, key) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.items)) return res.items;
    if (key && Array.isArray(res[key])) return res[key];
    if (key && Array.isArray(res.data?.[key])) return res.data[key];
    if (Array.isArray(res.data?.items)) return res.data.items;
    return [];
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadDropdowns() {
      setIsLoadingDropdowns(true);
      setErrorMessage(null);
      try {
        const [deptRes, schRes] = await Promise.allSettled([
          api.get('/departments'),
          api.get('/working-schedules'),
        ]);

        if (isMounted) {
          if (deptRes.status === 'fulfilled') {
            const depts = extractList(deptRes.value, 'departments');
            setDepartments(depts);
            if (depts.length > 0 && !formData.departmentId) {
              setFormData((prev) => ({ ...prev, departmentId: depts[0].id }));
            }
          }
          if (schRes.status === 'fulfilled') {
            const schs = extractList(schRes.value, 'schedules');
            setSchedules(schs);
            if (schs.length > 0 && !formData.workingScheduleId) {
              setFormData((prev) => ({ ...prev, workingScheduleId: schs[0].id }));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load modal options:', err);
      } finally {
        if (isMounted) setIsLoadingDropdowns(false);
      }
    }

    loadDropdowns();
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await api.post('/employees', {
        employeeNum: formData.employeeNum,
        workEmail: formData.workEmail,
        firstName: formData.firstName,
        lastName: formData.lastName,
        departmentId: formData.departmentId || undefined,
        workingScheduleId: formData.workingScheduleId || undefined,
        jobTitle: formData.jobTitle || undefined,
        workMode: formData.workMode || 'HYBRID',
        location: formData.location || 'Coimbatore',
        employmentType: formData.employmentType || 'FULL_TIME',
        bankAccountMasked: formData.bankAccountMasked || undefined,
      });

      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Employee creation error:', err);
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to save employee to PostgreSQL');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: '1rem', overflowY: 'auto' }}>
      <div className="modal-card" style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '640px', width: '100%', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.85rem' }}>
          <div>
            <h3 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Onboard New Team Member</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>Add a new engineer, designer, or specialist to the PeoplePay360 roster</p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.25rem', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            &times;
          </button>
        </div>

        {errorMessage && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem' }}>
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Row 1: Employee ID & Work Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Employee ID</label>
              <input
                type="text"
                required
                placeholder="PP360-1050"
                value={formData.employeeNum}
                onChange={(e) => setFormData({ ...formData, employeeNum: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Work Email</label>
              <input
                type="email"
                required
                placeholder="firstname.lastname@peoplepay360.in"
                value={formData.workEmail}
                onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Row 2: First Name & Last Name */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>First Name</label>
              <input
                type="text"
                required
                placeholder="Aravind"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Last Name</label>
              <input
                type="text"
                required
                placeholder="Kumar"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Row 3: Department & Working Schedule (Dynamic from PostgreSQL) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                Department / Squad {isLoadingDropdowns && <span style={{ color: '#3b82f6' }}>• loading...</span>}
              </label>
              <select
                required
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.code ? `(${d.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>
                Working Schedule {isLoadingDropdowns && <span style={{ color: '#3b82f6' }}>• loading...</span>}
              </label>
              <select
                required
                value={formData.workingScheduleId}
                onChange={(e) => setFormData({ ...formData, workingScheduleId: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
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

          {/* Row 4: Job Title Designation */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Designation / Job Title</label>
              <select
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Senior Software Engineer">Senior Software Engineer</option>
                <option value="Tech Lead">Tech Lead</option>
                <option value="Engineering Manager">Engineering Manager</option>
                <option value="QA Engineer">QA Engineer</option>
                <option value="Senior QA Engineer">Senior QA Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Cloud Engineer">Cloud Engineer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="HR Executive">HR Executive</option>
                <option value="Finance Analyst">Finance Analyst</option>
                <option value="Software Engineer Intern">Software Engineer Intern</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Work Mode</label>
              <select
                value={formData.workMode}
                onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
              >
                <option value="HYBRID">Hybrid (Office + WFH)</option>
                <option value="OFFICE">Office-Based</option>
                <option value="REMOTE">Full Remote</option>
              </select>
            </div>
          </div>

          {/* Row 5: Location & Employment Type */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Office Location</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
              >
                <option value="Coimbatore">Coimbatore (HQ)</option>
                <option value="Chennai">Chennai</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Remote">Remote (India)</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Employment Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#ffffff' }}
              >
                <option value="FULL_TIME">Full-time Regular</option>
                <option value="INTERN">Intern</option>
                <option value="CONTRACT">Contract</option>
                <option value="CONSULTANT">Consultant</option>
              </select>
            </div>
          </div>

          {/* Row 6: Bank Account Masked */}
          <div className="modal-form-group">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '0.35rem' }}>Bank Account Number (Masked Preview)</label>
            <input
              type="text"
              placeholder="••••••••9842"
              value={formData.bankAccountMasked}
              onChange={(e) => setFormData({ ...formData, bankAccountMasked: e.target.value })}
              style={{ width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <button
              type="button"
              className="btn-pill-secondary"
              onClick={onClose}
              style={{ padding: '0.6rem 1.25rem', borderRadius: '9999px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-pill-primary"
              disabled={isSubmitting}
              style={{ padding: '0.6rem 1.4rem', borderRadius: '9999px', border: 'none', background: '#0f172a', color: '#ffffff', fontSize: '0.85rem', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Saving to PostgreSQL...' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
