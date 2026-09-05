import { api } from '../../api/client';
import { Payslip } from '../../api/types';
import { router } from '../../router';
import { extractData, extractList, refreshIcons } from '../../utils/ui';

export async function loadPayslipDetailView(container: HTMLElement, payslipId: string): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-muted);">
      <p>Loading payslip from PostgreSQL...</p>
    </div>
  `;

  try {
    const res = await api.get(`/payroll/payslips/${payslipId}`).catch(() => null);
    let payslip: Payslip | null = extractData<Payslip | null>(res, null);

    if (!payslip) {
      const allRes = await api.get('/payroll/payslips?limit=50').catch(() => ({ data: [] }));
      const all = extractList<Payslip>(allRes);
      payslip = all.find((p) => p.id === payslipId || p.id.startsWith(payslipId)) || null;
    }

    if (!payslip) {
      container.innerHTML = `
        <div class="card" style="padding: 2rem;">
          <div class="detail-header-actions">
            <button class="btn-back" id="btn-back-payslips"><i data-lucide="arrow-left"></i> Back to Payslips</button>
          </div>
          <div style="text-align: center; padding: 2rem 0; color: var(--text-muted);">
            <h3>Payslip Not Found</h3>
            <p style="margin-top: 0.5rem;">Could not locate payslip record with ID: <code>${payslipId}</code></p>
          </div>
        </div>
      `;
      container.querySelector('#btn-back-payslips')?.addEventListener('click', () => router.navigate('/payslips'));
      refreshIcons();
      return;
    }

    const empName = payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : 'Employee';

    container.innerHTML = `
      <div>
        <div class="breadcrumb-container">
          <a href="/dashboard" class="breadcrumb-link" data-link>Dashboard</a>
          <span class="breadcrumb-separator">/</span>
          <a href="/payslips" class="breadcrumb-link" data-link>Payslips</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">PS-${payslip.id.slice(0, 8).toUpperCase()} (${empName})</span>
        </div>

        <div class="detail-header-actions">
          <button class="btn-back" id="btn-back-payslips">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Payslips
          </button>
          <a href="http://localhost:3000/api/v1/payroll/payslips/${payslip.id}/html" target="_blank" class="btn-back" style="text-decoration: none; color: var(--primary);">
            <i data-lucide="printer" style="width: 16px; height: 16px;"></i> Printable PDF / HTML
          </a>
        </div>

        <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <div>
              <span class="badge blue" style="margin-bottom: 0.5rem;">PAYSLIP STATEMENT</span>
              <h2 style="font-size: 1.4rem; font-weight: 800; color: var(--text-main);">PS-${payslip.id.slice(0, 8).toUpperCase()}</h2>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.25rem;">Employee: <strong>${empName}</strong> &bull; Period: ${new Date(payslip.periodStart).toLocaleDateString()} - ${new Date(payslip.periodEnd).toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Net Salary</div>
              <div style="font-size: 1.75rem; font-weight: 800; color: var(--green);">₹${Number(payslip.netSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <div>
              <h4 style="font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">Earnings Summary</h4>
              <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.9rem;">
                <span style="color: var(--text-muted);">Gross Salary</span>
                <span style="font-weight: 700;">₹${Number(payslip.grossSalary).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div>
              <h4 style="font-weight: 700; margin-bottom: 1rem; color: var(--text-main);">Deductions Summary</h4>
              <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); font-size: 0.9rem;">
                <span style="color: var(--text-muted);">Total Statutory Deductions</span>
                <span style="font-weight: 700; color: var(--red);">₹${Number(payslip.deductionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-back-payslips')?.addEventListener('click', () => router.back());
    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}
