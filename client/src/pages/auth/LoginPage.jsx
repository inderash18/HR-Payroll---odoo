import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../../api/client';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('indhu.admin@peoplepay360.in');
  const [password, setPassword] = useState('PeoplePay360@123');
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
    <div className="login-screen-wrapper">
      <div className="login-card">
        {/* Left side: Hero / Building Brand Image */}
        <div className="login-image-content">
          <div className="login-brand-badge">
            <span className="brand-dot"></span>
            <span>PEOPLEPAY360</span>
          </div>
          <div className="login-hero-overlay">
            <div className="hero-quote">
              <p className="hero-quote-title">Next-Gen Workforce Operations</p>
              <p className="hero-quote-sub">Automated Payroll, Real-time Attendance & RBAC Compliance.</p>
            </div>
          </div>
        </div>

        {/* Right side: Modern enterprise form */}
        <div className="login-form-side">
          <div className="login-header-group">
            <div className="login-sys-badge">ENTERPRISE CLOUD</div>
            <h1 className="login-title">Sign In</h1>
            <p className="login-subtitle">
              Access your PeoplePay360 HR & Payroll Workspace
            </p>
          </div>

          <div className="login-notice-box">
            <div className="notice-icon">🛡️</div>
            <div className="notice-content">
              <strong>Secure Organization Portal:</strong> Sign in with your registered email or employee ID credentials.
            </div>
          </div>

          <form id="login-form" onSubmit={handleSubmit} className="login-form-body">
            <div className="form-field-group">
              <label className="field-label" htmlFor="login-email">Work Email</label>
              <div className="input-control">
                <input
                  type="text"
                  id="login-email"
                  placeholder="name@peoplepay360.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-field-group">
              <div className="field-label-row">
                <label className="field-label" htmlFor="login-password">Password</label>
                <a
                  href="#forgot"
                  id="btn-forgot-password"
                  className="link-forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowForgotModal(true);
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="input-control input-with-action">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="btn-pwd-toggle"
                  id="btn-toggle-pwd"
                  title={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="login-remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember session for 30 days</span>
              </label>
            </div>

            {error && (
              <div id="login-error-msg" className="login-error-banner">
                <span className="error-dot">●</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn-login-action"
              id="btn-login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spin-animation" />
                  <span>Authenticating secure session...</span>
                </>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>
          </form>

          <div className="login-footer-meta">
            <span>Powered by ODOO Architecture</span>
            <span className="meta-sep">•</span>
            <span>256-Bit SSL Encrypted</span>
          </div>
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
