import { router } from '../../router';
import { refreshIcons } from '../../utils/ui';

export function loadNotFoundView(container: HTMLElement): void {
  container.innerHTML = `
    <div class="card" style="padding: 3.5rem 2rem;">
      <div class="error-page-container">
        <div class="error-icon-shield" style="background: #f1f5f9; color: var(--primary);">
          <i data-lucide="compass" style="width: 36px; height: 36px;"></i>
        </div>
        <h2 class="error-page-title">Page Not Found</h2>
        <p class="error-page-desc">
          The requested page <code>${window.location.pathname}</code> does not exist on PeoplePay360.
        </p>
        <div class="error-page-actions">
          <button class="btn-primary" id="btn-404-home" style="width: auto; padding: 0.65rem 1.35rem;">
            <i data-lucide="home"></i> Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  `;

  container.querySelector('#btn-404-home')?.addEventListener('click', () => {
    router.navigate('/dashboard');
  });
  refreshIcons();
}
