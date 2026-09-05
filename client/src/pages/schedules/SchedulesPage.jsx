import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Plus } from 'lucide-react';

export function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    timezone: 'Asia/Kolkata',
    type: 'FIXED',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data?.schedules || res.data || []);
    } catch (err) {
      console.error('Failed to load schedules:', err);
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
      await api.post('/schedules', {
        ...formData,
        lines: [
          { dayOfWeek: 1, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 2, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 3, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 4, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 5, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
        ],
      });
      setShowModal(false);
      setFormData({ name: '', timezone: 'Asia/Kolkata', type: 'FIXED' });
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to create schedule');
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
            Working Schedules ({schedules.length})
          </h2>
          <button
            className="btn-pill-primary"
            id="btn-add-schedule-header"
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} />
            <span>Add Schedule</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Schedule Name</th>
                <th style={{ padding: '0.85rem 1rem' }}>Type</th>
                <th style={{ padding: '0.85rem 1rem' }}>Timezone</th>
                <th style={{ padding: '0.85rem 1rem' }}>Work Days</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading working schedules from PostgreSQL...
                  </td>
                </tr>
              ) : schedules.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No working schedules configured.
                  </td>
                </tr>
              ) : (
                schedules.map((s) => (
                  <tr key={s.id}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '1rem' }}>{s.type}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{s.timezone}</td>
                    <td style={{ padding: '1rem' }}>{s.lines?.length || 5} days / week</td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${s.active !== false ? 'green' : 'orange'}`}>
                        {s.active !== false ? 'ACTIVE' : 'INACTIVE'}
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
              <h3 className="modal-title">Create Working Schedule</h3>
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
                <label>Schedule Name</label>
                <input
                  type="text"
                  required
                  placeholder="Standard Indian Work Week (Mon-Fri 9:30-6:30)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>Timezone</label>
                  <input
                    type="text"
                    required
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Schedule Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="FIXED">Fixed Hours (40h/week)</option>
                    <option value="FLEXIBLE">Flexible Working Hours</option>
                    <option value="SHIFT">Rotating Shift</option>
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
                  {isSubmitting ? 'Saving...' : 'Save Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
