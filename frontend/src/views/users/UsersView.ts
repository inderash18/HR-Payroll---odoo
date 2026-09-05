import { api } from '../../api/client';
import { extractList, refreshIcons, showToast } from '../../utils/ui';

export async function loadUsersView(container: HTMLElement): Promise<void> {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted);">
      <div style="text-align: center;">
        <i data-lucide="refresh-cw" class="animate-spin" style="width: 32px; height: 32px; margin-bottom: 0.5rem;"></i>
        <p>Loading Users from PostgreSQL...</p>
      </div>
    </div>
  `;
  refreshIcons();

  try {
    const res = await api.get('/users?limit=50').catch(() => ({ data: [] }));
    const users = extractList<any>(res);

    container.innerHTML = `
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <h2>User Accounts (${users.length})</h2>
          <button class="btn-primary" id="btn-add-user-header" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="user-plus"></i> Create User
          </button>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">User</th>
                <th style="padding: 0.75rem 1rem;">Email</th>
                <th style="padding: 0.75rem 1rem;">Role</th>
                <th style="padding: 0.75rem 1rem;">Joined</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                users.length > 0
                  ? users
                      .map(
                        (u) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${u.firstName || ''} ${u.lastName || ''}</td>
                      <td style="padding: 1rem; color: var(--text-muted);">${u.email}</td>
                      <td style="padding: 1rem;"><span class="badge blue">${(u.role || 'ADMIN').replace(/_/g, ' ')}</span></td>
                      <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${u.isActive !== false ? 'green' : 'red'}">${u.isActive !== false ? 'ACTIVE' : 'INACTIVE'}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No users found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-add-user-header')?.addEventListener('click', () => {
      openAddUserModal(() => loadUsersView(container));
    });

    refreshIcons();
  } catch (err: any) {
    container.innerHTML = `<div class="card" style="padding: 2rem; color: #ef4444;">Error: ${err.message}</div>`;
  }
}

export function openAddUserModal(onCreated?: () => void): void {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Create New User</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="add-user-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>First Name</label>
              <input type="text" id="usr-first" placeholder="Rajesh" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Last Name</label>
              <input type="text" id="usr-last" placeholder="Kumar" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Work Email</label>
            <input type="email" id="usr-email" placeholder="rajesh.kumar@peoplepay360.local" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Password</label>
              <input type="password" id="usr-pwd" placeholder="Strong Password" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>RBAC Role</label>
              <select id="usr-role" style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="ADMIN">System Administrator</option>
                <option value="HR_MANAGER">HR Manager</option>
                <option value="HR_PAYROLL_MANAGER">HR Payroll Manager</option>
                <option value="HR_PAYROLL_USER">Payroll Officer</option>
                <option value="EMPLOYEE">Employee Portal</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-usr" style="width: auto; padding: 0.6rem 1.5rem;">Create User</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#add-user-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-usr') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Creating in PostgreSQL...';

    try {
      await api.post('/users', {
        email: (modalBackdrop.querySelector('#usr-email') as HTMLInputElement).value,
        password: (modalBackdrop.querySelector('#usr-pwd') as HTMLInputElement).value,
        firstName: (modalBackdrop.querySelector('#usr-first') as HTMLInputElement).value,
        lastName: (modalBackdrop.querySelector('#usr-last') as HTMLInputElement).value,
        role: (modalBackdrop.querySelector('#usr-role') as HTMLSelectElement).value,
      });

      showToast('User created successfully in PostgreSQL', 'success');
      close();
      if (onCreated) onCreated();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Create User';
    }
  });
}
