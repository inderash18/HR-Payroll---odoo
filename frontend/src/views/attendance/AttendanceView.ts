import { api } from '../../api/client';
import { Attendance } from '../../api/types';
import { extractList, refreshIcons, showToast } from '../../utils/ui';

export async function loadAttendanceView(container: HTMLElement): Promise<void> {
  try {
    const res = await api.get('/attendance?limit=50');
    const logs = extractList<Attendance>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Attendance Log (${logs.length} Entries)</h2>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn-primary" id="btn-clock-in" style="width: auto; padding: 0.6rem 1.2rem; background: var(--green);">
              <i data-lucide="log-in"></i> Clock In
            </button>
            <button class="btn-primary" id="btn-clock-out" style="width: auto; padding: 0.6rem 1.2rem; background: var(--primary);">
              <i data-lucide="log-out"></i> Clock Out
            </button>
          </div>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Date</th>
                <th style="padding: 0.75rem 1rem;">Check In</th>
                <th style="padding: 0.75rem 1rem;">Check Out</th>
                <th style="padding: 0.75rem 1rem;">Worked Hours</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                logs.length > 0
                  ? logs
                      .map(
                        (a) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : 'Current User'}</td>
                      <td style="padding: 1rem;">${new Date(a.date).toLocaleDateString()}</td>
                      <td style="padding: 1rem; color: var(--green);">${a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—'}</td>
                      <td style="padding: 1rem; color: var(--text-muted);">${a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—'}</td>
                      <td style="padding: 1rem; font-weight: 600;">${a.workedHours ? `${Number(a.workedHours).toFixed(1)} hrs` : 'In Progress'}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${a.status === 'PRESENT' ? 'green' : 'orange'}">${a.status}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No attendance records found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-clock-in')?.addEventListener('click', async () => {
      try {
        await api.post('/attendance/clock-in', { timestamp: new Date().toISOString() });
        showToast('Clock-in recorded in PostgreSQL', 'success');
        loadAttendanceView(container);
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    });

    document.getElementById('btn-clock-out')?.addEventListener('click', async () => {
      try {
        await api.post('/attendance/clock-out', { timestamp: new Date().toISOString() });
        showToast('Clock-out recorded and hours computed', 'success');
        loadAttendanceView(container);
      } catch (err: any) {
        showToast(err.message, 'error');
      }
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}
