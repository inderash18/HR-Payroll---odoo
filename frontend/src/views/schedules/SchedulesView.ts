import { api } from '../../api/client';
import { WorkingSchedule } from '../../api/types';
import { extractList, refreshIcons, showToast } from '../../utils/ui';

export async function loadSchedulesView(container: HTMLElement): Promise<void> {
  try {
    const res = await api.get('/working-schedules');
    const schedules = extractList<WorkingSchedule>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Working Schedules (${schedules.length})</h2>
          <button class="btn-primary" id="btn-add-schedule-header" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="plus"></i> Add Schedule
          </button>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Schedule Name</th>
                <th style="padding: 0.75rem 1rem;">Type</th>
                <th style="padding: 0.75rem 1rem;">Timezone</th>
                <th style="padding: 0.75rem 1rem;">Work Days</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                schedules.length > 0
                  ? schedules
                      .map(
                        (s) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${s.name}</td>
                      <td style="padding: 1rem;">${s.type}</td>
                      <td style="padding: 1rem; color: var(--text-muted);">${s.timezone}</td>
                      <td style="padding: 1rem;">${s.lines?.length || 5} days / week</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${s.active ? 'green' : 'orange'}">${s.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No working schedules configured.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-schedule-header')?.addEventListener('click', () => {
      openAddScheduleModal(() => loadSchedulesView(container));
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

export function openAddScheduleModal(onCreated?: () => void): void {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create Working Schedule</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-schedule-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Schedule Name</label>
            <input type="text" id="sch-name" placeholder="Standard Indian Work Week (Mon-Fri 9:30-6:30)" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Timezone</label>
              <input type="text" id="sch-tz" value="Asia/Kolkata" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Schedule Type</label>
              <select id="sch-type" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="FIXED">Fixed Hours (40h/week)</option>
                <option value="FLEXIBLE">Flexible Working Hours</option>
                <option value="SHIFT">Rotating Shift</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-sch" style="width: auto; padding: 0.6rem 1.5rem;">Save Schedule</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#add-schedule-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-sch') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Saving in PostgreSQL...';

    try {
      await api.post('/working-schedules', {
        name: (modalBackdrop.querySelector('#sch-name') as HTMLInputElement).value,
        timezone: (modalBackdrop.querySelector('#sch-tz') as HTMLInputElement).value,
        type: (modalBackdrop.querySelector('#sch-type') as HTMLSelectElement).value,
        lines: [
          { dayOfWeek: 1, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 2, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 3, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 4, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
          { dayOfWeek: 5, startTime: '09:30', endTime: '18:30', breakMinutes: 60 },
        ],
      });

      showToast('Working schedule created', 'success');
      close();
      if (onCreated) onCreated();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Save Schedule';
    }
  });
}
