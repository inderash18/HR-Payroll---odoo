import { api } from '../api/client';
import { User, Role } from '../api/types';

export interface UserSession {
  id: string;
  device: string;
  ipAddress: string;
  createdAt: string;
  isCurrent: boolean;
}

export interface SecurityEvent {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  error: string | null;
}

let state: AuthState = {
  user: null,
  status: 'loading',
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

  /**
   * Initial session check on app open / page refresh.
   * Calls /auth/me with automatic transparent refresh handling.
   */
  bootstrap: async (): Promise<User | null> => {
    state.status = 'loading';
    state.isLoading = true;
    state.error = null;
    notify();

    try {
      const response = await api.get<{ success: boolean; data: User }>('/auth/me');
      const user = response.data || (response as any);
      state.user = user;
      state.status = 'authenticated';
      state.isLoading = false;
      state.error = null;
      notify();
      return state.user;
    } catch {
      state.user = null;
      state.status = 'unauthenticated';
      state.isLoading = false;
      notify();
      return null;
    }
  },

  /**
   * Authenticates credentials, establishes HttpOnly session cookies, and loads user profile.
   */
  login: async (email: string, password: string): Promise<User> => {
    state.isLoading = true;
    state.error = null;
    notify();

    try {
      await api.post('/auth/login', { email: email.trim(), password });

      // Authoritative profile retrieval
      const profileRes = await api.get<{ success: boolean; data: User }>('/auth/me');
      const user = profileRes.data || (profileRes as any);

      state.user = user;
      state.status = 'authenticated';
      state.isLoading = false;
      state.error = null;
      notify();
      return state.user;
    } catch (err: any) {
      state.user = null;
      state.status = 'unauthenticated';
      state.isLoading = false;
      state.error = err.message || 'Authentication failed';
      notify();
      throw err;
    }
  },

  /**
   * Revokes current server session, clears auth cookies, and resets client auth state.
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout request warning:', e);
    }
    state.user = null;
    state.status = 'unauthenticated';
    state.error = null;
    state.isLoading = false;
    notify();
  },

  /**
   * Revokes all active refresh sessions across all devices for the current user.
   */
  logoutAll: async (): Promise<void> => {
    try {
      await api.post('/auth/logout-all');
    } catch (e) {
      console.warn('Logout-all request warning:', e);
    }
    state.user = null;
    state.status = 'unauthenticated';
    state.error = null;
    state.isLoading = false;
    notify();
  },

  /**
   * Retrieves all active sessions for the current authenticated user.
   */
  getSessions: async (): Promise<UserSession[]> => {
    try {
      const res = await api.get<UserSession[] | { data: UserSession[] }>('/auth/sessions');
      if (Array.isArray(res)) return res;
      if (Array.isArray((res as any)?.data)) return (res as any).data;
      return [];
    } catch (err) {
      console.warn('Failed to load active sessions:', err);
      return [];
    }
  },

  /**
   * Revokes a specific session by ID.
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  /**
   * Changes the authenticated user's account password.
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  /**
   * Requests a password reset email token.
   */
  requestPasswordReset: async (organizationCode: string, email: string): Promise<string> => {
    const res = await api.post<{ message: string }>('/auth/password-reset/request', {
      organizationCode,
      email,
    });
    return res.message || 'If the account exists, a reset link has been dispatched.';
  },

  /**
   * Confirms password reset with token.
   */
  confirmPasswordReset: async (token: string, newPassword: string): Promise<string> => {
    const res = await api.post<{ message: string }>('/auth/password-reset/confirm', {
      token,
      newPassword,
    });
    return res.message || 'Password has been reset successfully.';
  },

  /**
   * Checks role authorization.
   */
  hasRole: (...roles: Role[]): boolean => {
    if (!state.user) return false;
    if (state.user.role === 'ADMIN') return true;
    return roles.includes(state.user.role);
  },
};
