import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Clock, CheckCircle2, LogIn, LogOut } from 'lucide-react';

export function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadAttendance = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendance');
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post('/attendance/clock-in', {});
      setMessage({ type: 'success', text: 'Clock-in recorded successfully!' });
      loadAttendance();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Clock-in failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setMessage(null);
    try {
      await api.post('/attendance/clock-out', {});
      setMessage({ type: 'success', text: 'Clock-out recorded successfully!' });
      loadAttendance();
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Clock-out failed' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Attendance & Timesheets
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Employee punch records, clock in/out tracking, and worked hours.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleClockIn} disabled={actionLoading}>
            <LogIn size={16} /> Clock In Today
          </button>
          <button className="btn btn-secondary" onClick={handleClockOut} disabled={actionLoading}>
            <LogOut size={16} /> Clock Out Today
          </button>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '12px 16px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
            color: message.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
            border: `1px solid ${message.type === 'success' ? 'var(--success-border)' : 'var(--danger-border)'}`,
            fontSize: '13.5px',
          }}
        >
          {message.text}
        </div>
      )}

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Worked Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No attendance logs found.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <strong>{log.employee?.firstName} {log.employee?.lastName}</strong>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{log.employee?.employeeNum}</div>
                  </td>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>{new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>
                    {log.checkOut
                      ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : <span style={{ color: '#d97706' }}>Active (Clocked In)</span>}
                  </td>
                  <td>
                    {log.workedHours !== null && log.workedHours !== undefined ? (
                      <strong>{Number(log.workedHours).toFixed(2)} hrs</strong>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
