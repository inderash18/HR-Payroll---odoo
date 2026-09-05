import { api } from '../../api/client';
import { Employee, Contract } from '../../api/types';
import { router } from '../../router';
import { extractData, extractList, refreshIcons } from '../../utils/ui';

export async function loadEmployeeDetailView(container: HTMLElement, employeeId: string): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-muted);">
      <p>Loading employee record from PostgreSQL...</p>
    </div>
  `;

  try {
    const [empRes, contractsRes] = await Promise.all([
      api.get(`/employees/${employeeId}`).catch(() => null),
      api.get(`/contracts?employeeId=${employeeId}`).catch(() => ({ data: [] })),
    ]);

    let employee: Employee | null = extractData<Employee | null>(empRes, null);
    if (!employee) {
      const allRes = await api.get('/employees?limit=50').catch(() => ({ data: [] }));
      const all = extractList<Employee>(allRes);
      employee = all.find((e) => e.id === employeeId || e.employeeNum === employeeId) || null;
    }

    if (!employee) {
      container.innerHTML = `
        <div class="card" style="padding: 2rem;">
          <div class="detail-header-actions">
            <button class="btn-back" id="btn-back-employees"><i data-lucide="arrow-left"></i> Back to Employees</button>
          </div>
          <div style="text-align: center; padding: 2rem 0; color: var(--text-muted);">
            <h3>Employee Not Found</h3>
            <p style="margin-top: 0.5rem;">Could not locate employee record with ID: <code>${employeeId}</code></p>
          </div>
        </div>
      `;
      container.querySelector('#btn-back-employees')?.addEventListener('click', () => router.navigate('/employees'));
      refreshIcons();
      return;
    }

    const contracts = extractList<Contract>(contractsRes);
    const primaryContract = contracts.find((c) => c.status === 'ACTIVE') || contracts[0];
    const roleLabel = ((employee as any).user?.role || employee.jobPosition?.title || 'EMPLOYEE').replace(/_/g, ' ');

    container.innerHTML = `
      <div>
        <!-- Breadcrumb Navigation -->
        <div class="breadcrumb-container">
          <a href="/dashboard" class="breadcrumb-link" data-link>Dashboard</a>
          <span class="breadcrumb-separator">/</span>
          <a href="/employees" class="breadcrumb-link" data-link>Employees</a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">${employee.firstName} ${employee.lastName}</span>
        </div>

        <div class="detail-header-actions">
          <button class="btn-back" id="btn-back-employees">
            <i data-lucide="arrow-left" style="width: 16px; height: 16px;"></i> Back to Employees
          </button>
          <button class="btn-back" id="btn-goto-contracts">
            <i data-lucide="file-signature" style="width: 16px; height: 16px;"></i> View Contracts
          </button>
        </div>

        <!-- Main Employee Detail Card -->
        <div class="card" style="padding: 2rem; margin-bottom: 1.5rem;">
          <div style="display: flex; gap: 1.5rem; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1.5rem; margin-bottom: 1.5rem;">
            <div style="width: 68px; height: 68px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
              ${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <h2 style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">${employee.firstName} ${employee.lastName}</h2>
                <span class="badge ${employee.isActive ? 'green' : 'red'}">${employee.isActive ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
              <p style="color: var(--text-muted); font-size: 0.88rem; margin-top: 0.25rem;">
                Employee Number: <strong>${employee.employeeNum}</strong> &bull; Work Email: <strong>${employee.workEmail}</strong>
              </p>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
            <div class="profile-info-group">
              <span class="profile-info-label">Department</span>
              <span class="profile-info-val">${employee.department?.name || 'Not assigned'}</span>
            </div>
            <div class="profile-info-group">
              <span class="profile-info-label">Designation / Role</span>
              <span class="profile-info-val">${employee.jobPosition?.title || roleLabel}</span>
            </div>
            <div class="profile-info-group">
              <span class="profile-info-label">Bank Account (Masked)</span>
              <span class="profile-info-val" style="font-family: monospace;">${employee.bankAccountMasked || '••••••••'}</span>
            </div>
            <div class="profile-info-group">
              <span class="profile-info-label">Working Schedule</span>
              <span class="profile-info-val">${employee.workingSchedule?.name || 'Standard 40h/week'}</span>
            </div>
            <div class="profile-info-group">
              <span class="profile-info-label">Contract Status</span>
              <span class="profile-info-val">
                ${primaryContract ? `<span class="badge green">ACTIVE (₹${Number(primaryContract.wage || 0).toLocaleString('en-IN')}/mo)</span>` : '<span class="badge orange">NO ACTIVE CONTRACT</span>'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#btn-back-employees')?.addEventListener('click', () => {
      router.back();
    });

    container.querySelector('#btn-goto-contracts')?.addEventListener('click', () => {
      router.navigate('/contracts');
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}
