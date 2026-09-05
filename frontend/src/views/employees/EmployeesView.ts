import { api } from '../../api/client';
import { Employee } from '../../api/types';
import { router } from '../../router';
import { extractList, refreshIcons } from '../../utils/ui';
import { openAddEmployeeModal } from './AddEmployeeModal';

export async function loadEmployeesView(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: var(--text-muted);">
      <p>Loading employee records from PostgreSQL...</p>
    </div>
  `;

  try {
    const res = await api.get('/employees?limit=50');
    const employees = extractList<Employee>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>Employee Directory (${employees.length})</h2>
          <button class="btn-primary" id="btn-add-emp-header" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="user-plus"></i> Add Employee
          </button>
        </div>
        <div class="table-responsive" style="overflow-x: auto; padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">
                <th style="padding: 0.75rem 1.5rem;">Emp #</th>
                <th style="padding: 0.75rem 1rem;">Name</th>
                <th style="padding: 0.75rem 1rem;">Work Email</th>
                <th style="padding: 0.75rem 1rem;">Department</th>
                <th style="padding: 0.75rem 1rem;">Designation</th>
                <th style="padding: 0.75rem 1rem;">Bank Masked</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                employees.length > 0
                  ? employees
                      .map(
                        (e) => `
                    <tr class="clickable-row" data-emp-id="${e.id}" style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">
                        <a href="/employees/${e.id}" data-link style="color: inherit; text-decoration: none;">${e.employeeNum}</a>
                      </td>
                      <td style="padding: 1rem;">${e.firstName} ${e.lastName}</td>
                      <td style="padding: 1rem; color: var(--text-muted);">${e.workEmail}</td>
                      <td style="padding: 1rem;">${e.department?.name || '—'}</td>
                      <td style="padding: 1rem;">${e.jobPosition?.title || '—'}</td>
                      <td style="padding: 1rem; font-family: monospace;">${e.bankAccountMasked || '••••••••'}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${e.isActive ? 'green' : 'red'}">${e.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">No employee records found in PostgreSQL.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-emp-header')?.addEventListener('click', () => {
      openAddEmployeeModal(() => loadEmployeesView(container));
    });

    container.querySelectorAll('.clickable-row[data-emp-id]').forEach((row) => {
      row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'A') return;
        const id = (row as HTMLElement).dataset.empId;
        if (id) router.navigate(`/employees/${id}`);
      });
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}
