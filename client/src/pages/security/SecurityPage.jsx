import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, ShieldCheck, Laptop, LogOut, CheckCircle2 } from 'lucide-react';

export function SecurityPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await api.get('/auth/sessions').catch(() => ({ data: [] }));
        setSessions(res.data?.sessions || res.data || []);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      }
    }
    loadSessions();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });

    if (newPassword !== confirmPassword) {
      setMsg({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setIsUpdating(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setMsg({
        text: 'Password changed successfully. Please sign in with your new password.',
        type: 'success',
      });
      setTimeout(async () => {
        await logout();
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setMsg({
        text: err.response?.data?.message || err.message || 'Failed to update password.',
        type: 'error',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogoutAll = async () => {
    if (window.confirm('Are you sure you want to sign out from all devices? You will be logged out of this session.')) {
      try {
        await api.post('/auth/logout-all');
        await logout();
        navigate('/login', { replace: true });
      } catch (err) {
        alert(err.response?.data?.message || err.message || 'Failed to logout all devices');
      }
    }
  };

  return (
    <div style={{ maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
          Account Security & Sessions
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
          Manage passwords, active browser sessions, and security credentials
        </p>
      </div>

      <div className="security-grid">
        {/* PASSWORD CHANGE CARD */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--primary)',
                color: '#ffffff',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>Change Password</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Update your authentication password regularly.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange}>
            <div className="modal-form-group">
              <label>Current Password</label>
              <input
                type="password"
                required
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="modal-form-group">
              <label>New Password</label>
              <input
                type="password"
                required
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="modal-form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {msg.text && (
              <div
                style={{
                  fontSize: '0.84rem',
                  marginBottom: '1rem',
                  fontWeight: 600,
                  color: msg.type === 'success' ? 'var(--green-text)' : 'var(--red-text)',
                  background: msg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                }}
              >
                {msg.text}
              </div>
            )}

            <button
              type="submit"
              className="btn-pill-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* ACTIVE SESSION CARD */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--blue-bg)',
                color: 'var(--blue-text)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Session & Device Security
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Current device signature and active authentications.
              </p>
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              background: 'var(--bg-surface)',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge green" style={{ fontSize: '0.72rem' }}>
                  CURRENT DEVICE
                </span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.4rem', color: 'var(--text-main)' }}>
                  Windows • Chrome / Desktop
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  IP: 127.0.0.1 (Local)
                </p>
              </div>
              <Laptop size={24} style={{ color: 'var(--primary)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn-pill-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => {}}
            >
              Active Sessions ({sessions.length || 1})
            </button>
            <button
              type="button"
              className="btn-pill-secondary"
              style={{ width: '100%', justifyContent: 'center', color: 'var(--red-text)' }}
              onClick={handleLogoutAll}
            >
              <LogOut size={16} />
              <span>Log Out All Devices</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
