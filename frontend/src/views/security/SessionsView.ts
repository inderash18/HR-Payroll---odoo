import { router } from '../../router';
import { authStore } from '../../state/auth';
import { refreshIcons, showToast } from '../../utils/ui';

export async function loadSessionsView(container: HTMLElement): Promise<void> {
  const sessions = await authStore.getSessions();

  container.innerHTML = `
    <div style="max-width: 800px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2>Active Sessions (${sessions.length})</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Devices currently authenticated to your account</p>
        </div>
        <div class="detail-header-actions" style="margin-bottom: 0;">
          <button class="btn-back" id="btn-back-security">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Security
          </button>
          <button class="btn-secondary" id="btn-sessions-logout-all" style="color: var(--red);">
            <i data-lucide="log-out"></i> Log Out Other Sessions
          </button>
        </div>
      </div>

      <div class="card" style="padding: 1.5rem;">
        <div class="sessions-list">
          ${
            sessions.length > 0
              ? sessions
                  .map(
                    (s) => `
                <div class="session-row ${s.isCurrent ? 'current' : ''}">
                  <div class="session-icon">
                    <i data-lucide="${s.device.toLowerCase().includes('mobile') || s.device.toLowerCase().includes('phone') ? 'smartphone' : 'laptop'}"></i>
                  </div>
                  <div class="session-details">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <span class="session-device-name">${s.device}</span>
                      ${s.isCurrent ? `<span class="badge green">THIS DEVICE</span>` : ''}
                    </div>
                    <div class="session-meta">
                      IP: ${s.ipAddress} &bull; Authenticated: ${new Date(s.createdAt).toLocaleString()}
                    </div>
                  </div>
                  ${
                    !s.isCurrent
                      ? `
                    <button class="btn-text btn-revoke-session" data-id="${s.id}" style="color: var(--red); font-size: 0.85rem; font-weight: 600;">
                      Revoke
                    </button>
                  `
                      : ''
                  }
                </div>
              `,
                  )
                  .join('')
              : '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No active sessions found.</p>'
          }
        </div>
      </div>
    </div>
  `;

  refreshIcons();

  container.querySelector('#btn-back-security')?.addEventListener('click', () => {
    router.navigate('/security');
  });

  // Revoke single session
  container.querySelectorAll('.btn-revoke-session').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id && confirm('Revoke this session? That device will be signed out.')) {
        try {
          await authStore.revokeSession(id);
          showToast('Session revoked', 'info');
          loadSessionsView(container);
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      }
    });
  });

  // Log out other sessions
  container.querySelector('#btn-sessions-logout-all')?.addEventListener('click', async () => {
    if (confirm('Log out of all devices? This will invalidate all refresh tokens.')) {
      await authStore.logoutAll();
      showToast('All sessions invalidated', 'info');
    }
  });
}
