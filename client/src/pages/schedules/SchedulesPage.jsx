import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { CalendarCheck, Clock } from 'lucide-react';

export function SchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSchedules() {
      try {
        const res = await api.get('/working-schedules');
        setSchedules(res.data || []);
      } catch (err) {
        console.error('Failed to load schedules:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSchedules();
  }, []);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Working Schedules & Shift Configurations
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Standard corporate working hours, shifts, and weekly rest days.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {isLoading ? (
          <div>Loading working schedules...</div>
        ) : schedules.length === 0 ? (
          <div>No working schedules configured.</div>
        ) : (
          schedules.map((s) => (
            <div key={s.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div className="stat-icon-box" style={{ background: '#f1f5f9', color: '#0f172a' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{s.name}</h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Timezone: {s.timezone}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Working Days & Hours
                </div>
                {s.lines?.length > 0 ? (
                  s.lines.map((l) => (
                    <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                      <strong style={{ width: '40px' }}>{daysOfWeek[l.dayOfWeek]}</strong>
                      <span>{l.startTime} — {l.endTime}</span>
                      <span style={{ color: '#64748b' }}>Break: {l.breakMinutes}m</span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>No shift lines specified</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
