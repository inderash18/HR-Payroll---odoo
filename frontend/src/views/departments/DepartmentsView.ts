import { api } from '../../api/client';
import { Department } from '../../api/types';
import { extractList, refreshIcons, showToast } from '../../utils/ui';

export async function loadDepartmentsView(container: HTMLElement): Promise<void> {
  try {
    const res = await api.get('/departments?limit=50');
    const departments = extractList<Department>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Departments (${departments.length})</h2>
          <button class="btn-primary" id="btn-add-dept-header" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="plus"></i> Add Department
          </button>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Code</th>
                <th style="padding: 0.75rem 1rem;">Department Name</th>
                <th style="padding: 0.75rem 1rem;">Staff Count</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                departments.length > 0
                  ? departments
                      .map(
                        (d) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${d.code}</td>
                      <td style="padding: 1rem;">${d.name}</td>
                      <td style="padding: 1rem;">${d._count?.employees || 0} Members</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge green">ACTIVE</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--text-muted);">No departments configured.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-dept-header')?.addEventListener('click', () => {
      openAddDepartmentModal(() => loadDepartmentsView(container));
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

export function openAddDepartmentModal(onCreated?: () => void): void {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Department</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-dept-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Department Code</label>
            <input type="text" id="dept-code" placeholder="ENG" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Department Name</label>
            <input type="text" id="dept-name" placeholder="Engineering & Technology" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-dept" style="width: auto; padding: 0.6rem 1.5rem;">Create Department</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#add-dept-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-dept') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Creating in PostgreSQL...';

    try {
      await api.post('/departments', {
        code: (modalBackdrop.querySelector('#dept-code') as HTMLInputElement).value,
        name: (modalBackdrop.querySelector('#dept-name') as HTMLInputElement).value,
      });

      showToast('Department created', 'success');
      close();
      if (onCreated) onCreated();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Create Department';
    }
  });
}
