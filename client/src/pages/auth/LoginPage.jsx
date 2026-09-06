import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../../api/client';
import { getRoleDashboardPath } from '../../config/navigation.config';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('indhu.admin@odoo.in');
  const [password, setPassword] = useState('Odoo@123');
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
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = "";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const user = await login(email, password);
      const targetPath = getRoleDashboardPath(user?.role);
      navigate(targetPath, { replace: true });
    } catch (err) {
      let msg = err.message || 'Invalid email or password.';
      if (err.status === 429) msg = 'Too many login attempts. Please try again shortly.';
      else if (err.code === 'NETWORK_ERROR' || err.status === 0) msg = 'Unable to connect to Odoo.';
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
        setResetMsg({ text: res.data?.message || 'Verification token dispatched to your email.', type: 'success' });
      } catch (err) {
        setResetMsg({ text: err.response?.data?.message || 'Failed to request password reset token.', type: 'error' });
      } finally {
        setResetLoading(false);
      }
    } else {
      try {
        const res = await api.post('/auth/reset-password', { token: resetToken, newPassword: resetNewPwd });
        setResetMsg({ text: res.data?.message || 'Password reset successfully. You may now sign in.', type: 'success' });
        setTimeout(() => {
          setShowForgotModal(false);
          setResetStep(1);
          setResetMsg({ text: '', type: '' });
        }, 1500);
      } catch (err) {
        setResetMsg({ text: err.response?.data?.message || 'Failed to confirm new password.', type: 'error' });
      } finally {
        setResetLoading(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center overflow-hidden font-['Inter',sans-serif]"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #8B4F67 0%, #520B6B 35%, #3A004D 70%, #23022E 100%)',
      }}
    >
      {/* Ambient Vignette Glow Spheres derived from reference image */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#9E4B88]/20 blur-[120px] pointer-events-none -top-20 -left-20"></div>
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#8B4F67]/25 blur-[100px] pointer-events-none -bottom-20 -right-20"></div>

      {/* The glass card */}
      <div className="w-full max-w-md md:max-w-[460px] bg-[#23022E]/60 backdrop-blur-[24px] border border-[#D9C3D2]/30 rounded-3xl shadow-[0_20px_50px_rgba(35,2,46,0.6)] overflow-hidden p-8 relative z-10 mx-4">

        {/* Header Section */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#FAF5F8]/15 border border-[#D9C3D2]/30 px-3.5 py-1 rounded-full mb-4 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-[#D9C3D2] animate-pulse"></div>
            <span className="text-[#FAF5F8] font-bold text-xs tracking-wider uppercase">ODOO WORKFORCE</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#FAF5F8] mb-2 tracking-tight font-['Manrope',sans-serif]">Sign In</h1>
          <p className="text-[#D9C3D2] text-sm">Access your Odoo Workforce &amp; Payroll Workspace</p>
        </div>

        {/* Notice Box */}
        <div className="bg-[#FAF5F8]/10 border border-[#D9C3D2]/25 rounded-2xl p-3.5 flex gap-3 mb-6 items-start">
          <ShieldCheck className="text-[#D9C3D2] mt-0.5 shrink-0" size={20} />
          <p className="text-[#FAF5F8] text-xs font-medium leading-relaxed">
            Secure Organization Portal: Sign in with your registered email or employee ID credentials.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="text-red-200 bg-red-950/80 p-3 rounded-xl text-xs font-semibold border border-red-500/40">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[#FAF5F8] text-xs font-medium ml-1">Work Email</label>
            <div className="relative">
              <input
                type="text"
                className="w-full h-11 bg-white/10 border border-[#D9C3D2]/30 rounded-xl px-4 text-[#FAF5F8] placeholder-[#D9C3D2]/60 outline-none focus:border-[#9E4B88] focus:ring-2 focus:ring-[#9E4B88]/30 transition-all text-sm"
                placeholder="name@odoo.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[#FAF5F8] text-xs font-medium">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[#D9C3D2] text-xs font-medium hover:underline hover:text-white bg-transparent border-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full h-11 bg-white/10 border border-[#D9C3D2]/30 rounded-xl px-4 pr-11 text-[#FAF5F8] placeholder-[#D9C3D2]/60 outline-none focus:border-[#9E4B88] focus:ring-2 focus:ring-[#9E4B88]/30 transition-all text-sm tracking-wider"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#D9C3D2] hover:text-white bg-transparent border-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <label className="flex items-center cursor-pointer mt-1 ml-1">
            <div className={`w-4.5 h-4.5 rounded-[4px] border ${rememberMe ? 'bg-[#8B4F67] border-[#8B4F67]' : 'bg-transparent border-[#D9C3D2]/50'} flex items-center justify-center transition-colors`}>
              <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[#D9C3D2] text-xs font-medium ml-2.5">Remember session for 30 days</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="h-11 w-full rounded-xl bg-[#8B4F67] hover:bg-[#753E54] active:bg-[#5E2C41] text-white font-semibold flex items-center justify-center transition-all border border-[#9E4B88]/40 shadow-lg cursor-pointer text-sm mt-2 hover:shadow-[0_0_20px_rgba(158,75,136,0.4)]"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
            {isLoading ? 'Authenticating...' : 'Sign In to Odoo'}
          </button>

          {/* Footer inside card */}
          <div className="mt-3 text-center">
            <p className="text-[11px] font-medium text-[#D9C3D2]/80">
              Powered by Odoo Architecture • 256-Bit SSL Encrypted
            </p>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-[var(--surface)] rounded-[24px] p-8 max-w-md w-full mx-4 shadow-2xl border border-[var(--border)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Manrope',sans-serif]">Reset Your Password</h3>
              <button onClick={() => { setShowForgotModal(false); setResetStep(1); setResetMsg({ text: '', type: '' }); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] border-none bg-transparent text-2xl cursor-pointer">&times;</button>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-6">Enter your registered work email. We will generate a secure single-use verification token to reset your password.</p>
            <form onSubmit={handleForgotSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Work Email</label>
                <input type="email" required placeholder="name@odoo.local" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full h-[50px] px-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors" />
              </div>
              {resetStep === 2 && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">Reset Token</label>
                    <input type="text" required placeholder="Enter token from email" value={resetToken} onChange={(e) => setResetToken(e.target.value)} className="w-full h-[50px] px-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">New Password</label>
                    <input type="password" required placeholder="Enter new strong password" value={resetNewPwd} onChange={(e) => setResetNewPwd(e.target.value)} className="w-full h-[50px] px-4 rounded-[24px] border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors" />
                  </div>
                </div>
              )}
              {resetMsg.text && (
                <div className={`mt-3 p-3 rounded-lg text-sm font-semibold ${resetMsg.type === 'success' ? 'bg-[var(--success-soft)] text-[var(--success)]' : 'bg-[var(--danger-soft)] text-[var(--danger)]'}`}>
                  {resetMsg.text}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForgotModal(false); setResetStep(1); setResetMsg({ text: '', type: '' }); }} className="px-6 py-2 rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] font-semibold cursor-pointer bg-transparent transition-colors">Cancel</button>
                <button type="submit" disabled={resetLoading} className="px-6 py-2 rounded-full bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] font-semibold cursor-pointer border-none flex items-center justify-center shadow-md transition-colors">
                  {resetLoading ? 'Processing...' : resetStep === 1 ? 'Send Reset Token' : 'Confirm New Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
