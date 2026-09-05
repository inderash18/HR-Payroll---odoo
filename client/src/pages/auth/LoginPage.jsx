import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import api from '../../api/client';
import { getRoleDashboardPath } from '../../config/navigation.config';

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
      else if (err.code === 'NETWORK_ERROR' || err.status === 0) msg = 'Unable to connect to PeoplePay360.';
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
      className="min-h-screen w-full relative flex items-center justify-center md:justify-end md:pr-[15%] overflow-hidden bg-cover bg-center font-['Inter',sans-serif]"
      style={{ backgroundImage: 'url("/ChatGPT Image Sep 6, 2026, 01_09_16 AM.png")' }}
    >
      {/* Blue Color Overlay */}
      <div className="absolute inset-0 bg-[#15438E] opacity-[0.1] z-0 pointer-events-none"></div>

      {/* The glass card */}
      <div className="w-full max-w-md md:max-w-[480px] bg-white/10 backdrop-blur-[24px] border border-white/30 rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden p-8 relative z-10 mx-4 md:mx-0">

        {/* Header Section */}
        <div className="mb-6">
          <div className="inline-block bg-white/20 border border-white/40 px-3 py-1 rounded-full mb-4">
            <span className="text-blue-500 font-semibold text-xs tracking-wider">ENTERPRISE CLOUD</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1a202c] mb-2 tracking-tight">Sign In</h1>
          <p className="text-gray-700 text-sm">Access your PeoplePay360 HR & Payroll Workspace</p>
        </div>

        {/* Notice Box */}
        <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 flex gap-3 mb-8 items-start">
          <ShieldCheck className="text-blue-600 mt-0.5 shrink-0" size={20} />
          <p className="text-[#2d3748] text-sm font-medium leading-relaxed">
            Secure Organization Portal: Sign in with your registered email or employee ID credentials.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="text-red-600 bg-red-100/80 p-3 rounded-xl text-sm font-semibold border border-red-200">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-white text-sm font-medium ml-1">Work Email</label>
            <div className="relative">
              <input
                type="text"
                className="w-full h-12 bg-white/10 border border-white/30 rounded-full px-5 text-white placeholder-white/50 outline-none focus:border-white/60 transition-colors"
                placeholder="name@peoplepay360.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center ml-1">
              <label className="text-white text-sm font-medium">Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-white text-sm font-medium hover:underline bg-transparent border-none cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full h-12 bg-white/10 border border-white/30 rounded-full px-5 pr-12 text-white placeholder-white/50 outline-none focus:border-white/60 transition-colors tracking-widest"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-transparent border-none cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <label className="flex items-center cursor-pointer mt-1 mb-2 ml-1">
            <div className={`w-5 h-5 rounded-[4px] border ${rememberMe ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-white/50'} flex items-center justify-center transition-colors`}>
              <input type="checkbox" className="hidden" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-white text-sm font-medium ml-3">Remember session for 30 days</span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 w-full rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-semibold flex items-center justify-center transition-colors border border-blue-400/50 shadow-lg"
          >
            {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : null}
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>

          {/* Footer inside card */}
          <div className="mt-4 text-center">
            <p className="text-[11px] font-medium text-[#1a202c]">
              Powered by Odoo Architecture • 256-Bit SSL Encrypted
            </p>
          </div>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-[24px] p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#0f1f3d]">Reset Your Password</h3>
              <button onClick={() => { setShowForgotModal(false); setResetStep(1); setResetMsg({ text: '', type: '' }); }} className="text-gray-500 hover:text-gray-800 border-none bg-transparent text-2xl cursor-pointer">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-6">Enter your registered work email. We will generate a secure single-use verification token to reset your password.</p>
            <form onSubmit={handleForgotSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-[#0f1f3d] mb-2">Work Email</label>
                <input type="email" required placeholder="name@peoplepay360.local" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full h-[50px] px-4 rounded-[24px] border-[1.34px] border-[#dce5f2] bg-[rgba(89,111,142,0.1)] text-[#0f1f3d] outline-none focus:border-blue-500 transition-colors" />
              </div>
              {resetStep === 2 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#0f1f3d] mb-2">Reset Token</label>
                    <input type="text" required placeholder="Enter token from email" value={resetToken} onChange={(e) => setResetToken(e.target.value)} className="w-full h-[50px] px-4 rounded-[24px] border-[1.34px] border-[#dce5f2] bg-[rgba(89,111,142,0.1)] text-[#0f1f3d] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-[#0f1f3d] mb-2">New Password</label>
                    <input type="password" required placeholder="Enter new strong password" value={resetNewPwd} onChange={(e) => setResetNewPwd(e.target.value)} className="w-full h-[50px] px-4 rounded-[24px] border-[1.34px] border-[#dce5f2] bg-[rgba(89,111,142,0.1)] text-[#0f1f3d] outline-none focus:border-blue-500 transition-colors" />
                  </div>
                </div>
              )}
              {resetMsg.text && (
                <div className={`mt-3 p-3 rounded-lg text-sm font-semibold ${resetMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {resetMsg.text}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowForgotModal(false); setResetStep(1); setResetMsg({ text: '', type: '' }); }} className="px-6 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer bg-white transition-colors">Cancel</button>
                <button type="submit" disabled={resetLoading} className="px-6 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 font-semibold cursor-pointer border-none flex items-center justify-center shadow-md transition-colors">
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
