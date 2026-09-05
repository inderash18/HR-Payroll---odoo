import { api } from '../../api/client';
import { Contract, Employee, SalaryStructure, WorkingSchedule } from '../../api/types';
import { extractList, refreshIcons, showToast } from '../../utils/ui';

export async function loadContractsView(container: HTMLElement): Promise<void> {
  try {
    const res = await api.get('/contracts?limit=50');
    const contracts = extractList<Contract>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Compensation Contracts (${contracts.length})</h2>
          <button class="btn-primary" id="btn-add-contract-header" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="plus"></i> Create Contract
          </button>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Contract Name</th>
                <th style="padding: 0.75rem 1rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Base Wage</th>
                <th style="padding: 0.75rem 1rem;">Salary Structure</th>
                <th style="padding: 0.75rem 1rem;">Period</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                contracts.length > 0
                  ? contracts
                      .map(
                        (c) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${c.name}</td>
                      <td style="padding: 1rem;">${c.employee ? `<a href="/employees/${c.employee.id}" data-link style="color: inherit; text-decoration: none; font-weight: 600;">${c.employee.firstName} ${c.employee.lastName} (${c.employee.employeeNum})</a>` : '—'}</td>
                      <td style="padding: 1rem; font-weight: 700;">₹${Number(c.wage).toLocaleString('en-IN', { minimumFractionDigits: 2 })} / ${c.wagePeriod}</td>
                      <td style="padding: 1rem;">${c.structure?.name || '—'}</td>
                      <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${new Date(c.startDate).toLocaleDateString()} &rarr; ${c.endDate ? new Date(c.endDate).toLocaleDateString() : 'Open-ended'}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${c.status === 'ACTIVE' ? 'green' : 'orange'}">${c.status}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No contracts found in PostgreSQL.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-contract-header')?.addEventListener('click', () => {
      openAddContractModal(() => loadContractsView(container));
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

export async function openAddContractModal(onCreated?: () => void): Promise<void> {
  const [empRes, structRes, schRes] = await Promise.all([
    api.get('/employees?limit=50').catch(() => ({ data: [] })),
    api.get('/payroll/structures').catch(() => ({ data: [] })),
    api.get('/working-schedules').catch(() => ({ data: [] })),
  ]);

  const emps = extractList<Employee>(empRes);
  const structs = extractList<SalaryStructure>(structRes);
  const schedules = extractList<WorkingSchedule>(schRes);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create Compensation Contract</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-contract-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Contract Name</label>
            <input type="text" id="cnt-name" placeholder="Software Engineer Level 2 Contract" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Employee</label>
              <select id="cnt-emp" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Employee...</option>
                ${emps.map((e) => `<option value="${e.id}">${e.firstName} ${e.lastName} (${e.employeeNum})</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Salary Structure</label>
              <select id="cnt-struct" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Structure...</option>
                ${structs.map((s) => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Base Wage (₹)</label>
              <input type="number" id="cnt-wage" placeholder="75000" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Wage Period</label>
              <select id="cnt-period" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="MONTHLY">Monthly</option>
                <option value="HOURLY">Hourly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="cnt-start" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Working Schedule</label>
              <select id="cnt-sched" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Default schedule</option>
                ${schedules.map((s) => `<option value="${s.id}">${s.name}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-contract" style="width: auto; padding: 0.6rem 1.5rem;">Create Contract</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#add-contract-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-contract') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Creating in PostgreSQL...';

    try {
      await api.post('/contracts', {
        name: (modalBackdrop.querySelector('#cnt-name') as HTMLInputElement).value,
        employeeId: (modalBackdrop.querySelector('#cnt-emp') as HTMLSelectElement).value,
        structureId: (modalBackdrop.querySelector('#cnt-struct') as HTMLSelectElement).value,
        wage: Number((modalBackdrop.querySelector('#cnt-wage') as HTMLInputElement).value),
        wagePeriod: (modalBackdrop.querySelector('#cnt-period') as HTMLSelectElement).value,
        startDate: (modalBackdrop.querySelector('#cnt-start') as HTMLInputElement).value,
        scheduleId: (modalBackdrop.querySelector('#cnt-sched') as HTMLSelectElement).value || undefined,
        status: 'ACTIVE',
      });

      showToast('Contract created in PostgreSQL', 'success');
      close();
      if (onCreated) onCreated();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Create Contract';
    }
  });
}
