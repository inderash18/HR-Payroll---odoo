import { router } from '../../router';
import { authStore } from '../../state/auth';
import { refreshIcons } from '../../utils/ui';

export async function loadProfileView(container: HTMLElement): Promise<void> {
  const user = authStore.getState().user;
  const displayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'User';
  const role = (user?.role || 'ADMIN').replace(/_/g, ' ');

  container.innerHTML = `
    <div style="max-width: 800px;">
      <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 2rem;">
          <div style="width: 72px; height: 72px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 800;">
            ${user?.firstName ? user.firstName.charAt(0) : 'U'}${user?.lastName ? user.lastName.charAt(0) : ''}
          </div>
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">${displayName}</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.2rem;">${user?.email || 'N/A'}</p>
            <span class="badge blue" style="margin-top: 0.5rem;">${role}</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1.5rem;">
          <div class="profile-info-group">
            <span class="profile-info-label">Organization</span>
            <span class="profile-info-val">${user?.organization?.name || 'Default Organization'} (${user?.organization?.code || 'DEV_ORG'})</span>
          </div>
          <div class="profile-info-group">
            <span class="profile-info-label">User ID</span>
            <span class="profile-info-val" style="font-family: monospace; font-size: 0.85rem;">${user?.id || 'dev-fixed-admin-id'}</span>
          </div>
          <div class="profile-info-group">
            <span class="profile-info-label">Account Role</span>
            <span class="profile-info-val">${role}</span>
          </div>
          <div class="profile-info-group">
            <span class="profile-info-label">Authentication Mode</span>
            <span class="profile-info-val"><span class="badge green">SECURE REFRESH COOKIE</span></span>
          </div>
        </div>
      </div>

      <div class="card" style="padding: 1.75rem; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="font-size: 1rem; font-weight: 700;">Manage Account Security</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Update your password or manage active devices</p>
        </div>
        <button class="btn-primary" id="btn-goto-security" style="width: auto; padding: 0.6rem 1.25rem;">
          <i data-lucide="shield"></i> Security Settings
        </button>
      </div>
    </div>
  `;

  refreshIcons();

  container.querySelector('#btn-goto-security')?.addEventListener('click', () => {
    router.navigate('/security');
  });
}
