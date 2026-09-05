import { api } from '../../api/client';
import { Payrun, Payslip } from '../../api/types';
import { router } from '../../router';
import { extractData, extractList, refreshIcons } from '../../utils/ui';

export async function loadPayrunDetailView(container: HTMLElement, payrunId: string): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-muted);">
      <p>Loading payrun details from PostgreSQL...</p>
    </div>
  `;

  try {
    const [payrunRes, payslipsRes] = await Promise.all([
      api.get(`/payroll/payruns/${payrunId}`).catch(() => null),
      api.get(`/payroll/payslips?payrunId=${payrunId}`).catch(() => ({ data: [] })),
    ]);

    let payrun: Payrun | null = extractData<Payrun | null>(payrunRes, null);
    if (!payrun) {
      const allRes = await api.get('/payroll/payruns?limit=50').catch(() => ({ data: [] }));
      const all = extractList<Payrun>(allRes);
      payrun = all.find((p) => p.id === payrunId) || null;
    }

    if (!payrun) {
      container.innerHTML = `
        <div class="card" style="padding: 2rem;">
          <div class="detail-header-actions">
            <button class="btn-back" id="btn-back-payroll"><i data-lucide="arrow-left"></i> Back to Payroll</button>
          </div>
          <div style="text-align: center; padding: 2rem 0; color: var(--text-muted);">
            <h3>Payrun Not Found</h3>
            <p style="margin-top: 0.5rem;">Could not locate payrun record with ID: <code>${payrunId}</code></p>
          </div>
        </div>
      `;
      container.querySelector('#btn-back-payroll')?.addEventListener('click', () => router.navigate('/payroll'));
      refreshIcons();
      return;
    }

    const payslips = extractList<Payslip>(payslipsRes);

    container.innerHTML = `
      <div>
        <div class="breadcrumb-container">
          <a href="/dashboard" class="breadcrumb-link" data-link>Dashboard</a>
          <span class="breadcrumb-separator">/</span>
          <a href="/payroll" class="breadcrumb-link" data-link>Payroll</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">${payrun.name}</span>
        </div>

        <div class="detail-header-actions">
          <button class="btn-back" id="btn-back-payroll">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Payroll
          </button>
        </div>

        <div class="card" style="padding: 1.75rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h2 style="font-size: 1.35rem; font-weight: 800;">${payrun.name}</h2>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.25rem;">
                Period: ${new Date(payrun.startDate).toLocaleDateString()} &ndash; ${new Date(payrun.endDate).toLocaleDateString()}
              </p>
            </div>
            <span class="badge ${payrun.status === 'PAID' ? 'green' : payrun.status === 'VALIDATED' ? 'blue' : 'orange'}">${payrun.status}</span>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Total Gross Disbursed</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-main); margin-top: 0.25rem;">₹${Number(payrun.totalGross || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Total Net Payable</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--green); margin-top: 0.25rem;">₹${Number(payrun.totalNet || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Slips Generated</div>
              <div style="font-size: 1.25rem; font-weight: 800; color: var(--primary); margin-top: 0.25rem;">${payslips.length}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2>Generated Slips in Batch (${payslips.length})</h2>
          </div>
          <div class="table-responsive" style="padding: 1rem 0;">
            <table class="data-table" style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                  <th style="padding: 0.75rem 1.5rem;">Slip Ref</th>
                  <th style="padding: 0.75rem 1rem;">Employee</th>
                  <th style="padding: 0.75rem 1rem;">Gross</th>
                  <th style="padding: 0.75rem 1rem;">Deductions</th>
                  <th style="padding: 0.75rem 1rem;">Net</th>
                  <th style="padding: 0.75rem 1.5rem;">Action</th>
                </tr>
              </thead>
              <tbody>
                ${
                  payslips.length > 0
                    ? payslips
                        .map(
                          (ps) => `
                      <tr class="clickable-row" data-payslip-id="${ps.id}" style="border-bottom: 1px solid var(--border);">
                        <td style="padding: 1rem 1.5rem; font-weight: 600;">PS-${ps.id.slice(0, 8).toUpperCase()}</td>
                        <td style="padding: 1rem;">${ps.employee ? `${ps.employee.firstName} ${ps.employee.lastName}` : 'Employee'}</td>
                        <td style="padding: 1rem; font-weight: 600;">₹${Number(ps.grossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 1rem; color: var(--red);">₹${Number(ps.deductionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 1rem; font-weight: 700; color: var(--green);">₹${Number(ps.netSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td style="padding: 1rem 1.5rem;">
                          <button class="btn-text btn-view-slip" data-id="${ps.id}" style="color: var(--primary); font-weight: 600;">View Slip</button>
                        </td>
                      </tr>
                    `,
                        )
                        .join('')
                    : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No payslips in this batch yet.</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-back-payroll')?.addEventListener('click', () => router.back());

    container.querySelectorAll('.btn-view-slip').forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = (b as HTMLElement).dataset.id;
        if (id) router.navigate(`/payslips/${id}`);
      });
    });

    container.querySelectorAll('.clickable-row[data-payslip-id]').forEach((row) => {
      row.addEventListener('click', () => {
        const id = (row as HTMLElement).dataset.payslipId;
        if (id) router.navigate(`/payslips/${id}`);
      });
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}
