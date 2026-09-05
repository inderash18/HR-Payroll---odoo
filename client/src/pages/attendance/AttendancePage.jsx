import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, LogOut, CheckCircle2, Search } from 'lucide-react';

export function AttendancePage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  const isAdmin = ['ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'ORGANIZATION_ADMIN'].includes(user?.role);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/attendance');
      setLogs(res.data?.attendance || res.data || []);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/clock-in', { timestamp: new Date().toISOString() });
      setToastMessage('Clock-in recorded in PostgreSQL');
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      setErrorToast(err.response?.data?.message || err.message || 'Clock-in failed');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await api.post('/attendance/clock-out', { timestamp: new Date().toISOString() });
      setToastMessage('Clock-out recorded and hours computed');
      setTimeout(() => setToastMessage(null), 3000);
      loadData();
    } catch (err) {
      setErrorToast(err.response?.data?.message || err.message || 'Clock-out failed');
      setTimeout(() => setErrorToast(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const empName = log.employee ? `${log.employee.firstName} ${log.employee.lastName}`.toLowerCase() : 'current user';
    return empName.includes(searchQuery.toLowerCase());
  });

  return (
    <div>
      <div className="card">
        <div
          className="card-header"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Attendance Log ({filteredLogs.length} Entries)
          </h2>
          
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {isAdmin ? (
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '0.5rem 1rem 0.5rem 2.25rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem',
                    outline: 'none',
                    minWidth: '220px'
                  }}
                />
              </div>
            ) : (
              <>
                <button
                  className="btn-pill-primary"
                  id="btn-clock-in"
                  style={{ background: 'var(--green)', borderColor: 'var(--green)' }}
                  onClick={handleClockIn}
                  disabled={actionLoading}
                >
                  <LogIn size={16} />
                  <span>Clock In</span>
                </button>
                <button
                  className="btn-pill-primary"
                  id="btn-clock-out"
                  onClick={handleClockOut}
                  disabled={actionLoading}
                >
                  <LogOut size={16} />
                  <span>Clock Out</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.85rem 1.25rem' }}>Employee</th>
                <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem' }}>Check In</th>
                <th style={{ padding: '0.85rem 1rem' }}>Check Out</th>
                <th style={{ padding: '0.85rem 1rem' }}>Worked Hours</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading attendance records from PostgreSQL...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                logs.map((a) => (
                  <tr key={a.id}>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600 }}>
                      {a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Current User'}
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(a.date).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', color: 'var(--green-text)', fontWeight: 600 }}>
                      {a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>
                      {a.workedHours ? `${Number(a.workedHours).toFixed(1)} hrs` : 'In Progress'}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span className={`badge ${a.status === 'PRESENT' ? 'green' : 'orange'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toastMessage && (
        <div id="toast-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
          <div className="toast" style={{ background: '#dcfce7', color: '#166534', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
      
      {errorToast && (
        <div id="error-toast-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
          <div className="toast" style={{ background: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <span style={{ fontWeight: 'bold' }}>Error:</span>
            <span>{errorToast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
