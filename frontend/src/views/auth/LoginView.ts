import { router } from '../../router';
import { authStore } from '../../state/auth';
import { refreshIcons, showToast } from '../../utils/ui';
import { openForgotPasswordModal } from './ForgotPasswordModal';

export function renderLogin(container: HTMLElement): void {
  container.innerHTML = `
    <div class="login-card">
      
      <!-- Left side: Image background content -->
      <div class="login-image-content">
      </div>

      <!-- Right side: White form container -->
      <div class="login-form-side">
        <div class="welcome-text" style="margin-top: 1rem;">
          <h1 style="font-size: 1.75rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;">Welcome to PeoplePay360</h1>
          <p style="color: #6b7280; font-size: 0.9rem; margin-top: 0.5rem;">Enterprise HR, Payroll & Compliance Platform</p>
        </div>

        <div style="margin-top: 1.25rem; padding: 0.85rem 1rem; background-color: #f8fafc; border-left: 4px solid var(--primary); border-radius: 6px;">
          <p style="color: #4b5563; font-size: 0.82rem; line-height: 1.45;">
            <strong>Secure Access:</strong> Use your registered work email or assigned employee ID.
          </p>
        </div>

        <form id="login-form" style="margin-top: 1.75rem;">
          <div class="stacked-inputs">
            <div class="input-row">
              <input type="text" id="login-email" placeholder="Work Email or Username (e.g. admin)" value="admin" required autocomplete="username" />
            </div>
            <div class="input-row input-with-toggle">
              <input type="password" id="login-password" placeholder="Password" value="123" required autocomplete="current-password" />
              <button type="button" class="btn-pwd-eye" id="btn-toggle-pwd" title="Show / Hide Password" tabindex="-1">
                <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
              </button>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
            <label style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.82rem; color: var(--text-muted); cursor: pointer;">
              <input type="checkbox" id="login-remember" checked style="cursor: pointer;" />
              <span>Remember session</span>
            </label>
            <a href="#" id="btn-forgot-password" style="color: var(--blue); font-size: 0.82rem; text-decoration: none; font-weight: 600;">Forgot Password?</a>
          </div>

          <div id="login-error-msg" style="margin-top: 1rem; padding: 0.65rem 0.85rem; border-radius: 6px; background: var(--red-bg); color: var(--red-text); font-size: 0.84rem; display: none; font-weight: 600;"></div>

          <button type="submit" class="btn-primary" id="btn-login-submit" style="margin-top: 1.5rem; width: 100%; border-radius: 10px; background-color: #0f1217; padding: 0.95rem; font-size: 0.95rem; font-weight: 700; color: #ffffff; cursor: pointer; border: none; display: flex; justify-content: center; align-items: center; gap: 0.5rem;">
            <span>Sign In</span>
          </button>
        </form>
      </div>
    </div>
  `;

  refreshIcons();

  const emailInput = document.getElementById('login-email') as HTMLInputElement;
  const passwordInput = document.getElementById('login-password') as HTMLInputElement;
  const togglePwdBtn = document.getElementById('btn-toggle-pwd') as HTMLButtonElement;
  const forgotPwdBtn = document.getElementById('btn-forgot-password') as HTMLAnchorElement;

  // Toggle show/hide password
  togglePwdBtn?.addEventListener('click', () => {
    const isPwd = passwordInput.type === 'password';
    passwordInput.type = isPwd ? 'text' : 'password';
    togglePwdBtn.innerHTML = isPwd
      ? `<i data-lucide="eye-off" style="width: 18px; height: 18px;"></i>`
      : `<i data-lucide="eye" style="width: 18px; height: 18px;"></i>`;
    refreshIcons();
  });

  // Forgot password modal
  forgotPwdBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openForgotPasswordModal();
  });

  const form = document.getElementById('login-form') as HTMLFormElement;
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btn-login-submit') as HTMLButtonElement;
    const errorBox = document.getElementById('login-error-msg');
    if (errorBox) errorBox.style.display = 'none';

    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="refresh-cw" class="animate-spin" style="width: 16px; height: 16px;"></i> <span>Authenticating...</span>`;
    refreshIcons();

    try {
      const user = await authStore.login(emailInput.value, passwordInput.value);
      const target = router.getReturnUrl() || '/dashboard';
      router.setReturnUrl(null);
      router.navigate(target, { replace: true });
      showToast(`Welcome back, ${user.firstName || 'User'}!`, 'success');
    } catch (err: any) {
      if (errorBox) {
        let msg = err.message || 'Invalid email or password.';
        if (err.status === 429) {
          msg = 'Too many login attempts. Please try again shortly.';
        } else if (err.code === 'NETWORK_ERROR' || err.status === 0) {
          msg = 'Unable to connect to PeoplePay360.';
        } else if (err.message && err.message.toLowerCase().includes('deactivated')) {
          msg = 'Your account is currently unavailable. Contact an administrator.';
        } else {
          msg = 'Invalid email or password.';
        }
        errorBox.innerText = msg;
        errorBox.style.display = 'block';
      }
      btn.disabled = false;
      btn.innerHTML = `<span>Sign In</span>`;
    }
  });
}
