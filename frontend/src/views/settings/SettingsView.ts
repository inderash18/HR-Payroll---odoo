import { authStore } from '../../state/auth';
import { refreshIcons } from '../../utils/ui';

export function loadSettingsView(container: HTMLElement): void {
  const user = authStore.getState().user;
  const displayName = `${user?.firstName || 'System'} ${user?.lastName || 'Administrator'}`.trim();
  const initial1 = user?.firstName?.charAt(0) || 'S';
  const initial2 = user?.lastName?.charAt(0) || 'A';

  container.innerHTML = `
    <div style="max-width: 700px;">
      <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
        <h2 style="margin-bottom: 1.5rem;">User Profile & Session</h2>
        <div style="display: flex; gap: 1.5rem; align-items: center; margin-bottom: 1.5rem;">
          <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
            ${initial1}${initial2}
          </div>
          <div>
            <h3>${displayName}</h3>
            <p style="color: var(--text-muted); font-size: 0.9rem;">${user?.email || 'admin@peoplepay360.local'}</p>
            <span class="badge blue" style="margin-top: 0.5rem;">${(user?.role || 'ADMIN').replace(/_/g, ' ')}</span>
          </div>
        </div>
      </div>

      <div class="card" style="padding: 2rem;">
        <h2 style="margin-bottom: 1rem;">System Information</h2>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">
          <strong>Database:</strong> PostgreSQL 18.6 (localhost:5432, db: peoplepay360)
        </p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 0.5rem;">
          <strong>Security:</strong> Fastify Helmet + HttpOnly Cookie Auth + SafeMathParser AST Engine
        </p>
        <p style="color: var(--text-muted); font-size: 0.9rem;">
          <strong>API Prefix:</strong> <code>/api/v1</code> (All REST API endpoints returning standardized JSON)
        </p>
      </div>
    </div>
  `;
  refreshIcons();
}
