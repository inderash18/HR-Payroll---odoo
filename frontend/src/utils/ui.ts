import { createIcons, icons } from 'lucide';

// Initialize Lucide icons on any rendered DOM
export function refreshIcons(): void {
  createIcons({
    icons: { ...icons },
  });
}

// Toast Notification Helper
export function showToast(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Helpers to extract data from standardized JSON API responses
export function extractList<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  if (Array.isArray(res)) return res;
  return [];
}

export function extractData<T>(res: any, defaultValue: T): T {
  if (!res) return defaultValue;
  if (res.data !== undefined) return res.data as T;
  return res as T;
}

// Fullscreen Loading View
export function renderLoading(container: HTMLElement): void {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 100vw; background: #f9fafb;">
      <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-bottom: 0.5rem;">PeoplePay360</div>
      <p style="color: #6b7280; font-size: 0.9rem;">Connecting to PostgreSQL 18 JSON Backend...</p>
    </div>
  `;
}
