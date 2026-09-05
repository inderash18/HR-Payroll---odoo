import { router } from '../../router';
import { refreshIcons } from '../../utils/ui';

export function loadAccessDeniedView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="card" style="padding: 3.5rem 2rem;">
      <div class="error-page-container">
        <div class="error-icon-shield">
          <i data-lucide="shield-alert" style="width: 36px; height: 36px;"></i>
        </div>
        <h2 class="error-page-title">Access Denied</h2>
        <p class="error-page-desc">
          You do not have the required permissions to view this resource. If you believe this is in error, please contact your organization administrator.
        </p>
        <div class="error-page-actions">
          <button class="btn-primary" id="btn-403-home" style="width: auto; padding: 0.65rem 1.35rem;">
            <i data-lucide="home"></i> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-403-home')?.addEventListener('click', () => {
    router.navigate('/dashboard');
  });
  refreshIcons();
}
