import { api } from '../../api/client';
import { Department, WorkingSchedule } from '../../api/types';
import { extractList, showToast } from '../../utils/ui';

export async function openAddEmployeeModal(onCreated?: () => void): Promise<void> {
  const [deptsRes, schedulesRes] = await Promise.all([
    api.get('/departments?limit=50').catch(() => ({ data: [] })),
    api.get('/working-schedules').catch(() => ({ data: [] })),
  ]);

  const depts = extractList<Department>(deptsRes);
  const schedules = extractList<WorkingSchedule>(schedulesRes);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Employee</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-employee-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Employee Number</label>
              <input type="text" id="emp-num" placeholder="EMP-00105" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Work Email</label>
              <input type="email" id="emp-email" placeholder="aarav.sharma@peoplepay360.local" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>First Name</label>
              <input type="text" id="emp-first" placeholder="Aarav" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" id="emp-last" placeholder="Sharma" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Department</label>
              <select id="emp-dept" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Department...</option>
                ${depts.map((d) => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Working Schedule</label>
              <select id="emp-schedule" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Schedule...</option>
                ${schedules.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="grid-column: span 2;">
              <label>Bank Account Number (Masked preview)</label>
              <input type="text" id="emp-bank" placeholder="••••••••9842" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-emp" style="width: auto; padding: 0.6rem 1.5rem;">Save Employee</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#add-employee-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const saveBtn = modalBackdrop.querySelector('#btn-save-emp') as HTMLButtonElement;
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving to PostgreSQL...';

    try {
      await api.post('/employees', {
        employeeNum: (modalBackdrop.querySelector('#emp-num') as HTMLInputElement).value,
        workEmail: (modalBackdrop.querySelector('#emp-email') as HTMLInputElement).value,
        firstName: (modalBackdrop.querySelector('#emp-first') as HTMLInputElement).value,
        lastName: (modalBackdrop.querySelector('#emp-last') as HTMLInputElement).value,
        departmentId: (modalBackdrop.querySelector('#emp-dept') as HTMLSelectElement).value || undefined,
        workingScheduleId: (modalBackdrop.querySelector('#emp-schedule') as HTMLSelectElement).value || undefined,
        bankAccountMasked: (modalBackdrop.querySelector('#emp-bank') as HTMLInputElement).value || undefined,
      });

      showToast('Employee created in PostgreSQL', 'success');
      close();
      if (onCreated) {
        onCreated();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Save Employee';
    }
  });
}
