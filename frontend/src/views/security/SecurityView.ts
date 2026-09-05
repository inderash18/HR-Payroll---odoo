import { router } from '../../router';
import { authStore } from '../../state/auth';
import { refreshIcons, showToast } from '../../utils/ui';

export async function loadSecurityView(container: HTMLElement): Promise<void> {
  const sessions = await authStore.getSessions();
  const currentSession = sessions.find((s) => s.isCurrent) || sessions[0];

  container.innerHTML = `
    <div style="max-width: 900px;">
      <div style="margin-bottom: 1.5rem;">
        <h2>Account Security & Sessions</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Manage passwords, active browser sessions, and security credentials</p>
      </div>

      <div class="security-grid">
        <!-- PASSWORD CHANGE CARD -->
        <div class="card security-card">
          <div class="security-card-header">
            <div class="security-card-icon">
              <i data-lucide="key-round"></i>
            </div>
            <div>
              <h3>Change Password</h3>
              <p>Update your authentication password regularly.</p>
            </div>
          </div>

          <form id="change-pwd-form" style="margin-top: 1.25rem;">
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Current Password</label>
              <input type="password" id="pwd-current" placeholder="Enter current password" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">New Password</label>
              <input type="password" id="pwd-new" placeholder="Enter new strong password" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 1.25rem;">
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary);">Confirm New Password</label>
              <input type="password" id="pwd-confirm" placeholder="Confirm new password" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;" />
            </div>

            <div id="change-pwd-msg" style="display: none; font-size: 0.82rem; margin-bottom: 1rem;"></div>

            <button type="submit" class="btn-primary" id="btn-change-pwd" style="width: 100%; padding: 0.75rem;">
              Update Password
            </button>
          </form>
        </div>

        <!-- ACTIVE SESSION & RECOVERY CARD -->
        <div class="card security-card">
          <div class="security-card-header">
            <div class="security-card-icon" style="background: var(--blue-bg); color: var(--blue-text);">
              <i data-lucide="shield-check"></i>
            </div>
            <div>
              <h3>Session & Device Security</h3>
              <p>Current device signature and active authentications.</p>
            </div>
          </div>

          <div style="margin-top: 1.25rem; border: 1px solid var(--border-subtle); border-radius: 0.75rem; padding: 1.25rem; background: var(--bg-surface);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <span class="badge green" style="font-size: 0.72rem;">CURRENT DEVICE</span>
                <h4 style="font-size: 0.95rem; font-weight: 700; margin-top: 0.4rem;">${currentSession?.device || 'Windows • Chrome / Desktop'}</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.2rem;">IP: ${currentSession?.ipAddress || '127.0.0.1 (Local)'}</p>
              </div>
              <i data-lucide="laptop" style="color: var(--primary); width: 24px; height: 24px;"></i>
            </div>
          </div>

          <div style="margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <button class="btn-secondary" id="btn-view-all-sessions" style="width: 100%; justify-content: center; padding: 0.75rem;">
              <i data-lucide="list"></i> View All Sessions (${sessions.length})
            </button>
            <button class="btn-secondary" id="btn-logout-all-devices" style="width: 100%; justify-content: center; padding: 0.75rem; color: var(--red);">
              <i data-lucide="log-out"></i> Log Out All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  refreshIcons();

  // Password change submission
  const pwdForm = container.querySelector('#change-pwd-form') as HTMLFormElement;
  const msgBox = container.querySelector('#change-pwd-msg') as HTMLDivElement;
  const submitBtn = container.querySelector('#btn-change-pwd') as HTMLButtonElement;

  pwdForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    msgBox.style.display = 'none';

    const currentPassword = (container.querySelector('#pwd-current') as HTMLInputElement).value;
    const newPassword = (container.querySelector('#pwd-new') as HTMLInputElement).value;
    const confirmPassword = (container.querySelector('#pwd-confirm') as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      msgBox.style.display = 'block';
      msgBox.style.color = 'var(--red)';
      msgBox.innerText = 'New passwords do not match.';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerText = 'Updating...';

    try {
      await authStore.changePassword(currentPassword, newPassword);
      showToast('Password changed successfully. Please sign in with your new password.', 'success');
      await authStore.logout();
    } catch (err: any) {
      msgBox.style.display = 'block';
      msgBox.style.color = 'var(--red)';
      msgBox.innerText = err.message || 'Failed to update password.';
      submitBtn.disabled = false;
      submitBtn.innerText = 'Update Password';
    }
  });

  // View All Sessions
  container.querySelector('#btn-view-all-sessions')?.addEventListener('click', () => {
    router.navigate('/sessions');
  });

  // Logout All Devices
  container.querySelector('#btn-logout-all-devices')?.addEventListener('click', async () => {
    if (confirm('Are you sure you want to sign out from all devices? You will be logged out of this session.')) {
      await authStore.logoutAll();
      showToast('Signed out from all devices', 'info');
    }
  });
}
