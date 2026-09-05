import { api } from '../../api/client';
import { Payrun, SalaryStructure } from '../../api/types';
import { router } from '../../router';
import { extractList, refreshIcons, showToast } from '../../utils/ui';

export async function loadPayrollView(container: HTMLElement): Promise<void> {
  try {
    const [payrunsRes, structuresRes] = await Promise.all([
      api.get('/payroll/payruns?limit=50').catch(() => ({ data: [] })),
      api.get('/payroll/structures').catch(() => ({ data: [] })),
    ]);

    const payruns = extractList<Payrun>(payrunsRes);
    const structures = extractList<SalaryStructure>(structuresRes);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2>Payroll & Payrun Batches</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Deterministic salary rules engine via Safe AST Parser (0 eval)</p>
        </div>
        <button class="btn-primary" id="btn-create-payrun" style="width: auto; padding: 0.6rem 1.2rem;">
          <i data-lucide="plus"></i> Create Payrun
        </button>
      </div>

      <div class="card" style="margin-bottom: 2rem;">
        <div class="card-header">
          <h2>Payrun Batches (${payruns.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Payrun Name</th>
                <th style="padding: 0.75rem 1rem;">Period</th>
                <th style="padding: 0.75rem 1rem;">Total Gross</th>
                <th style="padding: 0.75rem 1rem;">Total Net</th>
                <th style="padding: 0.75rem 1rem;">Status</th>
                <th style="padding: 0.75rem 1.5rem;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${
                payruns.length > 0
                  ? payruns
                      .map(
                        (p) => `
                    <tr class="clickable-row" data-payrun-id="${p.id}" style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">
                        <a href="/payroll/payruns/${p.id}" data-link style="color: inherit; text-decoration: none;">${p.name}</a>
                      </td>
                      <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${new Date(p.startDate).toLocaleDateString()} - ${new Date(p.endDate).toLocaleDateString()}</td>
                      <td style="padding: 1rem; font-weight: 600;">₹${Number(p.totalGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem; font-weight: 700; color: var(--green);">₹${Number(p.totalNet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem;"><span class="badge ${p.status === 'PAID' ? 'green' : p.status === 'VALIDATED' ? 'blue' : 'orange'}">${p.status}</span></td>
                      <td style="padding: 1rem 1.5rem;">
                        ${
                          p.status === 'DRAFT'
                            ? `<button class="btn-text btn-compute-payrun" data-id="${p.id}" style="color: var(--primary); font-weight: 600; margin-right: 0.5rem;">Compute</button>`
                            : ''
                        }
                        ${
                          p.status === 'COMPUTED'
                            ? `<button class="btn-text btn-validate-payrun" data-id="${p.id}" style="color: var(--blue); font-weight: 600; margin-right: 0.5rem;">Validate</button>`
                            : ''
                        }
                        ${
                          p.status === 'VALIDATED'
                            ? `<button class="btn-text btn-pay-payrun" data-id="${p.id}" style="color: var(--green); font-weight: 600;">Mark Paid</button>`
                            : ''
                        }
                        ${p.status === 'PAID' ? '<span style="color: var(--green); font-weight: 600;">✓ Disbursed</span>' : ''}
                      </td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No payrun batches found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2>Salary Structures (${structures.length})</h2>
        </div>
        <div style="padding: 1.5rem;">
          ${
            structures
              .map(
                (st) => `
            <div style="border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <h4 style="font-weight: 700;">${st.name} <span style="color: var(--text-muted); font-size: 0.85rem;">(${st.code})</span></h4>
                <span class="badge green">ACTIVE</span>
              </div>
              <p style="color: var(--text-muted); font-size: 0.85rem;">Rules count: ${st.rules?.length || 0} salary rules in execution sequence</p>
            </div>
          `,
              )
              .join('')
          }
        </div>
      </div>
    `;

    document.getElementById('btn-create-payrun')?.addEventListener('click', () => {
      openCreatePayrunModal(structures, () => loadPayrollView(container));
    });

    container.querySelectorAll('.clickable-row[data-payrun-id]').forEach((row) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'A' || (e.target as HTMLElement).tagName === 'BUTTON') return;
        const id = (row as HTMLElement).dataset.payrunId;
        if (id) router.navigate(`/payroll/payruns/${id}`);
      });
    });

    container.querySelectorAll('.btn-compute-payrun').forEach((b) => {
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/compute`);
          showToast('Payrun computed using Safe AST Math Parser', 'success');
          loadPayrollView(container);
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.btn-validate-payrun').forEach((b) => {
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/validate`);
          showToast('Payrun validated and payslips sealed', 'success');
          loadPayrollView(container);
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.btn-pay-payrun').forEach((b) => {
      b.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = (b as HTMLElement).dataset.id;
        try {
          await api.post(`/payroll/payruns/${id}/pay`, { paymentMethod: 'BANK_TRANSFER' });
          showToast('Payrun marked as PAID', 'success');
          loadPayrollView(container);
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

export function openCreatePayrunModal(structures: SalaryStructure[], onCreated?: () => void): void {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New Payrun Batch</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="create-payrun-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Payrun Batch Name</label>
            <input type="text" id="pr-name" placeholder="Payroll - September 2026" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Period Start Date</label>
              <input type="date" id="pr-start" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Period End Date</label>
              <input type="date" id="pr-end" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Salary Structure (Optional filter)</label>
            <select id="pr-struct" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
              <option value="">All active employee structures</option>
              ${structures.map((s) => `<option value="${s.id}">${s.name} (${s.code})</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-pr" style="width: auto; padding: 0.6rem 1.5rem;">Create Payrun</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#create-payrun-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-pr') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Creating in PostgreSQL...';

    try {
      await api.post('/payroll/payruns', {
        name: (modalBackdrop.querySelector('#pr-name') as HTMLInputElement).value,
        startDate: (modalBackdrop.querySelector('#pr-start') as HTMLInputElement).value,
        endDate: (modalBackdrop.querySelector('#pr-end') as HTMLInputElement).value,
        structureId: (modalBackdrop.querySelector('#pr-struct') as HTMLSelectElement).value || undefined,
      });

      showToast('Payrun batch created', 'success');
      close();
      if (onCreated) onCreated();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Create Payrun';
    }
  });
}
