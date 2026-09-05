import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, Smartphone, LogOut, ShieldCheck } from 'lucide-react';

export function SecurityPage() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  const loadSessions = async () => {
    try {
      const res = await api.get('/auth/sessions');
      setSessions(res.data || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsChanging(true);
    setMessage(null);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully! Please log in again.' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to change password' });
    } finally {
      setIsChanging(false);
    }
  };

  const handleRevokeSession = async (id) => {
    try {
      await api.delete(`/auth/sessions/${id}`);
      loadSessions();
    } catch (err) {
      alert('Failed to revoke session');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
          Account Security & Active Sessions
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Update password, review active devices, and terminate unauthorized sessions.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <KeyRound size={18} /> Update Password
            </div>
          </div>

          {message && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: 'var(--radius-md)',
                background: message.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: message.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
                fontSize: '13px',
              }}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isChanging}>
              {isChanging ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={18} /> Active Sessions & Devices
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: '14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px' }}>
                    {s.device} {s.isCurrent && <span className="badge badge-success" style={{ marginLeft: '6px' }}>Current</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    IP: {s.ipAddress} • {new Date(s.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {!s.isCurrent && (
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: '12px' }}
                    onClick={() => handleRevokeSession(s.id)}
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
