import { api } from '../api/client';
import { User, Role } from '../api/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

let state: AuthState = {
  user: null,
  isLoading: true,
  error: null,
};

const listeners = new Set<(state: AuthState) => void>();

function notify() {
  listeners.forEach((listener) => listener({ ...state }));
}

export const authStore = {
  getState: () => ({ ...state }),

  subscribe: (listener: (state: AuthState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  bootstrap: async () => {
    state.isLoading = true;
    state.error = null;
    notify();

    try {
      // Check current authenticated session via HttpOnly cookies from PostgreSQL
      const response = await api.get<{ success: boolean; data: User }>('/auth/me');
      state.user = response.data || (response as any);
      state.isLoading = false;
      notify();
      return state.user;
    } catch {
      state.user = null;
      state.isLoading = false;
      notify();
      return null;
    }
  },

  login: async (email: string, password: string) => {
    state.isLoading = true;
    state.error = null;
    notify();

    try {
      await api.post('/auth/login', { email, password });
      
      // Fetch authoritative user profile from PostgreSQL
      const profile = await api.get<{ success: boolean; data: User }>('/auth/me');
      state.user = profile.data || (profile as any);
      state.isLoading = false;
      notify();
      return state.user;
    } catch (err: any) {
      state.user = null;
      state.isLoading = false;
      state.error = err.message || 'Authentication failed';
      notify();
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout API error:', e);
    }
    state.user = null;
    state.error = null;
    state.isLoading = false;
    notify();
  },

  hasRole: (...roles: Role[]) => {
    if (!state.user) return false;
    if (state.user.role === 'ADMIN') return true;
    return roles.includes(state.user.role);
  },
};
