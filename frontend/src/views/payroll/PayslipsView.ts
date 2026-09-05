import { api } from '../../api/client';
import { Payslip } from '../../api/types';
import { router } from '../../router';
import { extractList, refreshIcons } from '../../utils/ui';

export async function loadPayslipsView(container: HTMLElement): Promise<void> {
  try {
    const res = await api.get('/payroll/payslips?limit=50');
    const payslips = extractList<Payslip>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header">
          <h2>Generated Payslips (${payslips.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Slip Ref</th>
                <th style="padding: 0.75rem 1rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Gross Salary</th>
                <th style="padding: 0.75rem 1rem;">Deductions</th>
                <th style="padding: 0.75rem 1rem;">Net Salary</th>
                <th style="padding: 0.75rem 1rem;">Status</th>
                <th style="padding: 0.75rem 1.5rem;">Official Document</th>
              </tr>
            </thead>
            <tbody>
              ${
                payslips.length > 0
                  ? payslips
                      .map(
                        (ps) => `
                    <tr class="clickable-row" data-payslip-id="${ps.id}" style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">
                        <a href="/payslips/${ps.id}" data-link style="color: inherit; text-decoration: none;">PS-${ps.id.slice(0, 8).toUpperCase()}</a>
                      </td>
                      <td style="padding: 1rem;">${ps.employee ? `${ps.employee.firstName} ${ps.employee.lastName}` : 'Employee'}</td>
                      <td style="padding: 1rem; font-weight: 600;">₹${Number(ps.grossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem; color: var(--red);">₹${Number(ps.deductionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem; font-weight: 700; color: var(--green);">₹${Number(ps.netSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td style="padding: 1rem;"><span class="badge green">COMPUTED</span></td>
                      <td style="padding: 1rem 1.5rem;">
                        <a href="http://localhost:3000/api/v1/payroll/payslips/${ps.id}/html" target="_blank" class="btn-text" style="color: var(--primary); font-weight: 600; text-decoration: none;">
                          <i data-lucide="file-text"></i> View HTML / Print
                        </a>
                      </td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">No payslips computed yet. Run a Payrun to generate slips.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.querySelectorAll('.clickable-row[data-payslip-id]').forEach((row) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'A') return;
        const id = (row as HTMLElement).dataset.payslipId;
        if (id) router.navigate(`/payslips/${id}`);
      });
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}
