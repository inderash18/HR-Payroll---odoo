import { authStore } from '../../state/auth';
import { showToast } from '../../utils/ui';

export function openForgotPasswordModal(): void {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 class="modal-title">Reset Your Password</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <div style="padding: 1.5rem;">
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem;">
          Enter your registered work email. We will generate a secure single-use verification token to reset your password.
        </p>

        <form id="forgot-password-form">
          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Work Email</label>
            <input type="email" id="reset-email" placeholder="aarav.sharma@peoplepay360.local" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;" />
          </div>

          <div id="reset-step-2" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Reset Token</label>
              <input type="text" id="reset-token" placeholder="Enter token from email" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;" />
            </div>
            <div class="form-group">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">New Password</label>
              <input type="password" id="reset-new-pwd" placeholder="Enter new strong password" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;" />
            </div>
          </div>

          <div id="reset-modal-msg" style="display: none; font-size: 0.82rem; margin-top: 0.75rem;"></div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
            <button type="button" class="btn-text" id="btn-cancel-reset">Cancel</button>
            <button type="submit" class="btn-primary" id="btn-submit-reset" style="width: auto; padding: 0.6rem 1.25rem;">
              Send Reset Token
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();

  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#btn-cancel-reset')?.addEventListener('click', close);

  let isStep2 = false;
  const form = modalBackdrop.querySelector('#forgot-password-form') as HTMLFormElement;
  const submitBtn = modalBackdrop.querySelector('#btn-submit-reset') as HTMLButtonElement;
  const msgBox = modalBackdrop.querySelector('#reset-modal-msg') as HTMLDivElement;

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgBox.style.display = 'none';

    if (!isStep2) {
      const email = (modalBackdrop.querySelector('#reset-email') as HTMLInputElement).value;
      submitBtn.disabled = true;
      submitBtn.innerText = 'Dispatching token...';

      try {
        const msg = await authStore.requestPasswordReset('DEV_ORG', email);
        isStep2 = true;
        (modalBackdrop.querySelector('#reset-step-2') as HTMLDivElement).style.display = 'block';
        msgBox.style.display = 'block';
        msgBox.style.color = 'var(--green)';
        msgBox.innerText = msg;
        submitBtn.disabled = false;
        submitBtn.innerText = 'Reset Password';
      } catch (err: any) {
        msgBox.style.display = 'block';
        msgBox.style.color = 'var(--red)';
        msgBox.innerText = err.message || 'Failed to request password reset.';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Send Reset Token';
      }
    } else {
      const token = (modalBackdrop.querySelector('#reset-token') as HTMLInputElement).value;
      const newPassword = (modalBackdrop.querySelector('#reset-new-pwd') as HTMLInputElement).value;

      try {
        const msg = await authStore.confirmPasswordReset(token, newPassword);
        showToast(msg, 'success');
        close();
      } catch (err: any) {
        msgBox.style.display = 'block';
        msgBox.style.color = 'var(--red)';
        msgBox.innerText = err.message || 'Failed to reset password.';
        submitBtn.disabled = false;
        submitBtn.innerText = 'Confirm New Password';
      }
    }
  });
}
