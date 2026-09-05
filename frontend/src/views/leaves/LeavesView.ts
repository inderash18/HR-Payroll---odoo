import { api } from '../../api/client';
import { Employee, LeaveAllocation, LeaveRequest, LeaveType } from '../../api/types';
import { extractList, refreshIcons, showToast } from '../../utils/ui';

export async function loadLeavesView(container: HTMLElement): Promise<void> {
  try {
    const [typesRes, requestsRes, allocationsRes] = await Promise.all([
      api.get('/leaves/types').catch(() => ({ data: [] })),
      api.get('/leaves/requests?limit=50').catch(() => ({ data: [] })),
      api.get('/leaves/allocations?limit=50').catch(() => ({ data: [] })),
    ]);

    const leaveTypes = extractList<LeaveType>(typesRes);
    const requests = extractList<LeaveRequest>(requestsRes);
    const allocations = extractList<LeaveAllocation>(allocationsRes);

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
        <div>
          <h2>Time Off & Leave Management</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">Balances, requests, and accruals tracking</p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn-secondary" id="btn-allocate-leave" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="plus-circle"></i> Allocate Leave
          </button>
          <button class="btn-primary" id="btn-request-leave" style="width: auto; padding: 0.6rem 1.2rem;">
            <i data-lucide="calendar-plus"></i> Request Time Off
          </button>
        </div>
      </div>

      <!-- LEAVE BALANCES CARDS -->
      <div class="kpi-grid" style="margin-bottom: 1.5rem;">
        ${
          leaveTypes
            .map(
              (t) => `
          <div class="kpi-card">
            <div class="kpi-title">${t.name} (${t.code})</div>
            <div class="kpi-value">${t.daysAllowed || 12} Days</div>
            <div class="kpi-trend" style="color: var(--text-muted);">${t.isPaid ? 'Paid Leave' : 'Unpaid Leave'}</div>
          </div>
        `,
            )
            .join('')
        }
      </div>

      <!-- RECENT REQUESTS TABLE -->
      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-header">
          <h2>Time Off Requests (${requests.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Leave Type</th>
                <th style="padding: 0.75rem 1rem;">Period</th>
                <th style="padding: 0.75rem 1rem;">Duration</th>
                <th style="padding: 0.75rem 1rem;">Status</th>
                <th style="padding: 0.75rem 1.5rem;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${
                requests.length > 0
                  ? requests
                      .map(
                        (r) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : 'Current User'}</td>
                      <td style="padding: 1rem;">${r.leaveType?.name || 'Annual Leave'}</td>
                      <td style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted);">${new Date(r.startDate).toLocaleDateString()} - ${new Date(r.endDate).toLocaleDateString()}</td>
                      <td style="padding: 1rem; font-weight: 600;">${r.numberOfDays} days</td>
                      <td style="padding: 1rem;"><span class="badge ${r.status === 'APPROVED' ? 'green' : r.status === 'REJECTED' ? 'red' : 'orange'}">${r.status}</span></td>
                      <td style="padding: 1rem 1.5rem;">
                        ${
                          r.status === 'PENDING_APPROVAL'
                            ? `
                          <button class="btn-text btn-approve-leave" data-id="${r.id}" style="color: var(--green); font-weight: 600; margin-right: 0.75rem;">Approve</button>
                          <button class="btn-text btn-reject-leave" data-id="${r.id}" style="color: var(--red); font-weight: 600;">Reject</button>
                        `
                            : '—'
                        }
                      </td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">No leave requests found.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ALLOCATIONS TABLE -->
      <div class="card">
        <div class="card-header">
          <h2>Leave Allocations (${allocations.length})</h2>
        </div>
        <div class="table-responsive" style="padding: 1rem 0;">
          <table class="data-table" style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border); text-align: left; font-size: 0.8rem; color: var(--text-muted);">
                <th style="padding: 0.75rem 1.5rem;">Employee</th>
                <th style="padding: 0.75rem 1rem;">Leave Type</th>
                <th style="padding: 0.75rem 1rem;">Allocated Days</th>
                <th style="padding: 0.75rem 1rem;">Valid Period</th>
                <th style="padding: 0.75rem 1.5rem;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                allocations.length > 0
                  ? allocations
                      .map(
                        (al) => `
                    <tr style="border-bottom: 1px solid var(--border);">
                      <td style="padding: 1rem 1.5rem; font-weight: 600;">${al.employee ? `${al.employee.firstName} ${al.employee.lastName}` : 'All Staff'}</td>
                      <td style="padding: 1rem;">${al.leaveType?.name || 'Annual Leave'}</td>
                      <td style="padding: 1rem; font-weight: 600;">${al.allocatedAmount || (al as any).allocatedDays || 0} days</td>
                      <td style="padding: 1rem; color: var(--text-muted);">${al.validFrom ? new Date(al.validFrom).toLocaleDateString() : new Date().getFullYear()}</td>
                      <td style="padding: 1rem 1.5rem;"><span class="badge ${al.status === 'APPROVED' ? 'green' : 'orange'}">${al.status}</span></td>
                    </tr>
                  `,
                      )
                      .join('')
                  : `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">No leave allocations registered.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    document.getElementById('btn-request-leave')?.addEventListener('click', () => {
      openRequestLeaveModal(leaveTypes, () => loadLeavesView(container));
    });

    document.getElementById('btn-allocate-leave')?.addEventListener('click', () => {
      openAllocateLeaveModal(leaveTypes, () => loadLeavesView(container));
    });

    container.querySelectorAll('.btn-approve-leave').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id;
        try {
          await api.post(`/leaves/requests/${id}/approve`);
          showToast('Leave request approved', 'success');
          loadLeavesView(container);
        } catch (err: any) {
          showToast(err.message, 'error');
        }
      });
    });

    container.querySelectorAll('.btn-reject-leave').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = (btn as HTMLElement).dataset.id;
        try {
          await api.post(`/leaves/requests/${id}/reject`, { reason: 'Operation schedule conflict' });
          showToast('Leave request rejected', 'info');
          loadLeavesView(container);
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

export function openAllocateLeaveModal(types: LeaveType[], onCreated?: () => void): void {
  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Allocate Annual Leave Days</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="allocate-leave-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div class="form-group">
            <label>Leave Type</label>
            <select id="alloc-type" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
              ${types.map((t) => `<option value="${t.id}">${t.name} (${t.code})</option>`).join('')}
            </select>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Number of Days</label>
              <input type="number" id="alloc-days" placeholder="18" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>Effective Year</label>
              <input type="number" id="alloc-year" value="${new Date().getFullYear()}" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-alloc" style="width: auto; padding: 0.6rem 1.5rem;">Confirm Allocation</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#allocate-leave-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-alloc') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Allocating in PostgreSQL...';

    try {
      await api.post('/leaves/allocations', {
        leaveTypeId: (modalBackdrop.querySelector('#alloc-type') as HTMLSelectElement).value,
        allocatedDays: Number((modalBackdrop.querySelector('#alloc-days') as HTMLInputElement).value),
        effectiveYear: Number((modalBackdrop.querySelector('#alloc-year') as HTMLInputElement).value),
        status: 'APPROVED',
      });

      showToast('Leave allocation confirmed', 'success');
      close();
      if (onCreated) onCreated();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Confirm Allocation';
    }
  });
}

export async function openRequestLeaveModal(types: LeaveType[], onCreated?: () => void): Promise<void> {
  const empRes = await api.get('/employees?limit=50').catch(() => ({ data: [] }));
  const emps = extractList<Employee>(empRes);

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'modal-backdrop';
  modalBackdrop.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Submit Time Off Request</h3>
        <button class="btn-close" id="modal-close">&times;</button>
      </div>
      <form id="request-leave-form">
        <div class="modal-body" style="padding: 1.5rem;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="form-group">
              <label>Employee</label>
              <select id="leave-emp" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                <option value="">Select Employee...</option>
                ${emps.map((e) => `<option value="${e.id}">${e.firstName} ${e.lastName}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Leave Type</label>
              <select id="leave-type" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; background: white;">
                ${types.map((t) => `<option value="${t.id}">${t.name} (${t.code})</option>`).join('')}
              </select>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
            <div class="form-group">
              <label>Start Date</label>
              <input type="date" id="leave-start" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
            <div class="form-group">
              <label>End Date</label>
              <input type="date" id="leave-end" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
            </div>
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Number of Days</label>
            <input type="number" id="leave-days" placeholder="2" required style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem;">
          </div>
          <div class="form-group" style="margin-top: 1rem;">
            <label>Reason / Notes (Optional)</label>
            <textarea id="leave-reason" placeholder="Personal appointment / medical leave..." style="width: 100%; padding: 0.65rem; border: 1px solid var(--border); border-radius: 0.5rem; min-height: 80px;"></textarea>
          </div>
        </div>
        <div class="modal-footer" style="padding: 1rem 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1rem;">
          <button type="button" class="btn-text" id="modal-cancel">Cancel</button>
          <button type="submit" class="btn-primary" id="btn-save-req" style="width: auto; padding: 0.6rem 1.5rem;">Submit Request</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalBackdrop);
  const close = () => modalBackdrop.remove();
  modalBackdrop.querySelector('#modal-close')?.addEventListener('click', close);
  modalBackdrop.querySelector('#modal-cancel')?.addEventListener('click', close);

  modalBackdrop.querySelector('#request-leave-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = modalBackdrop.querySelector('#btn-save-req') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerText = 'Submitting in PostgreSQL...';

    try {
      await api.post('/leaves/requests', {
        employeeId: (modalBackdrop.querySelector('#leave-emp') as HTMLSelectElement).value,
        leaveTypeId: (modalBackdrop.querySelector('#leave-type') as HTMLSelectElement).value,
        startDate: (modalBackdrop.querySelector('#leave-start') as HTMLInputElement).value,
        endDate: (modalBackdrop.querySelector('#leave-end') as HTMLInputElement).value,
        numberOfDays: Number((modalBackdrop.querySelector('#leave-days') as HTMLInputElement).value),
        reason: (modalBackdrop.querySelector('#leave-reason') as HTMLTextAreaElement).value || undefined,
      });

      showToast('Time off request submitted for approval', 'success');
      close();
      if (onCreated) onCreated();
    } catch (err: any) {
      showToast(err.message, 'error');
      btn.disabled = false;
      btn.innerText = 'Submit Request';
    }
  });
}
