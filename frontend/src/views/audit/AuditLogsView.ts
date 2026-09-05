import { api } from '../../api/client';
import { extractList, refreshIcons } from '../../utils/ui';

export async function loadAuditLogsView(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
      <div style="text-align: center;">
        <i data-lucide="refresh-cw" class="animate-spin" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
        <p>Loading Audit Logs from PostgreSQL...</p>
      </div>
    </div>
  `;
  refreshIcons();

  try {
    const res = await api.get('/audit?limit=50').catch(() => ({ data: [] }));
    const logs = extractList<any>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Immutable Security Audit Trail (${logs.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Timestamp</th>
                <th style="padding: 0.75rem 1rem;">Action</th>
                <th style="padding: 0.75rem 1rem;">Resource</th>
                <th style="padding: 0.75rem 1rem;">User / IP</th>
                <th style="padding: 0.75rem 1.5rem;">Details</th>
              </tr>
            </thead>
            <tbody>
              ${
                logs.length > 0
                  ? logs
                      .map(
                        (l) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-size: 0.85rem; color: var(--text-muted); font-family: monospace;">${new Date(l.createdAt || l.timestamp).toLocaleString()}</td>
                      <td style="padding: 1rem;"><span class="badge blue">${l.action}</span></td>
                      <td style="padding: 1rem; font-weight: 600;">${l.resource || l.entityName || 'System'}</td>
                      <td style="padding: 1rem; font-size: 0.85rem;">${l.user?.email || l.userId || 'system'} &bull; <span style="color: var(--text-muted);">${l.ipAddress || '127.0.0.1'}</span></td>
                      <td style="padding: 1rem 1.5rem; font-size: 0.85rem; color: var(--text-muted); font-family: monospace;">${JSON.stringify(l.details || {}).slice(0, 40)}</td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No security events recorded.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}
