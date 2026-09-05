import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@peoplepay360.local');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPwd, setResetNewPwd] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetMsg, setResetMsg] = useState({ text: '', type: '' });
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('login-page');
    return () => {
      document.body.classList.remove('login-page');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      let msg = err.message || 'Invalid email or password.';
      if (err.status === 429) {
        msg = 'Too many login attempts. Please try again shortly.';
      } else if (err.code === 'NETWORK_ERROR' || err.status === 0) {
        msg = 'Unable to connect to PeoplePay360.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setResetMsg({ text: '', type: '' });
    setResetLoading(true);

    if (resetStep === 1) {
      try {
        const res = await api.post('/auth/forgot-password', { email: resetEmail });
        setResetStep(2);
        setResetMsg({
          text: res.data?.message || 'Verification token dispatched to your email.',
          type: 'success',
        });
      } catch (err) {
        setResetMsg({
          text: err.response?.data?.message || 'Failed to request password reset token.',
          type: 'error',
        });
      } finally {
        setResetLoading(false);
      }
    } else {
      try {
        const res = await api.post('/auth/reset-password', {
          token: resetToken,
          newPassword: resetNewPwd,
        });
        setResetMsg({
          text: res.data?.message || 'Password reset successfully. You may now sign in.',
          type: 'success',
        });
        setTimeout(() => {
          setShowForgotModal(false);
          setResetStep(1);
          setResetMsg({ text: '', type: '' });
        }, 1500);
      } catch (err) {
        setResetMsg({
          text: err.response?.data?.message || 'Failed to confirm new password.',
          type: 'error',
        });
      } finally {
        setResetLoading(false);
      }
    }
  };

  return (
    <div id="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="login-card">
        {/* Left side: Image background content */}
        <div className="login-image-content">
          <div className="box-logo">PEOPLEPAY360</div>
        </div>

        {/* Right side: White form container */}
        <div className="login-form-side">
          <div className="welcome-text" style={{ marginTop: '1rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Welcome to PeoplePay360
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Enterprise HR, Payroll & Compliance Platform
            </p>
          </div>

          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#f8fafc',
              borderLeft: '4px solid var(--primary)',
              borderRadius: '6px',
            }}
          >
            <p style={{ color: '#4b5563', fontSize: '0.82rem', lineHeight: 1.45 }}>
              <strong>Secure Access:</strong> Use your registered work email or assigned employee ID.
            </p>
          </div>

          <form id="login-form" onSubmit={handleSubmit} style={{ marginTop: '1.75rem' }}>
            <div className="stacked-inputs">
              <div className="input-row">
                <input
                  type="text"
                  id="login-email"
                  placeholder="Work Email or Username (e.g. admin@peoplepay360.local)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="input-row input-with-toggle">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn-pwd-eye"
                  id="btn-toggle-pwd"
                  title="Show / Hide Password"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span>Remember session</span>
              </label>
              <a
                href="#forgot"
                id="btn-forgot-password"
                style={{ color: 'var(--blue)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600 }}
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotModal(true);
                }}
              >
                Forgot Password?
              </a>
            </div>

            {error && (
              <div
                id="login-error-msg"
                style={{
                  marginTop: '1rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  background: 'var(--red-bg)',
                  color: 'var(--red-text)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              id="btn-login-submit"
              disabled={isLoading}
              style={{
                marginTop: '1.5rem',
                width: '100%',
                borderRadius: '10px',
                backgroundColor: '#0f1217',
                padding: '0.95rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Reset Your Password</h3>
              <button
                className="modal-close-btn"
                onClick={() => {
                  setShowForgotModal(false);
                  setResetStep(1);
                  setResetMsg({ text: '', type: '' });
                }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Enter your registered work email. We will generate a secure single-use verification token to reset your password.
              </p>

              <form onSubmit={handleForgotSubmit}>
                <div className="modal-form-group">
                  <label>Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="aarav.sharma@peoplepay360.local"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                  />
                </div>

                {resetStep === 2 && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <div className="modal-form-group">
                      <label>Reset Token</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter token from email"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                      />
                    </div>
                    <div className="modal-form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Enter new strong password"
                        value={resetNewPwd}
                        onChange={(e) => setResetNewPwd(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {resetMsg.text && (
                  <div
                    style={{
                      fontSize: '0.84rem',
                      marginTop: '0.75rem',
                      fontWeight: 600,
                      color: resetMsg.type === 'success' ? 'var(--green-text)' : 'var(--red-text)',
                      background: resetMsg.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                    }}
                  >
                    {resetMsg.text}
                  </div>
                )}

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn-pill-secondary"
                    onClick={() => {
                      setShowForgotModal(false);
                      setResetStep(1);
                      setResetMsg({ text: '', type: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-pill-primary"
                    disabled={resetLoading}
                  >
                    {resetLoading
                      ? 'Processing...'
                      : resetStep === 1
                      ? 'Send Reset Token'
                      : 'Confirm New Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
