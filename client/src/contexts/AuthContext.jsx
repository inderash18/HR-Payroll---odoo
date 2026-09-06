import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Attempt silent refresh
  const attemptRefresh = useCallback(async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      );
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  // Bootstrap session on page refresh or startup
  const bootstrapSession = useCallback(async () => {
    setIsInitializing(true);
    setError(null);

    try {
      // 1. Try directly reading profile with existing access cookie
      const res = await api.get('/auth/me');
      if (res?.data) {
        setUser(res.data);
        return;
      }
    } catch (err) {
      // 2. If 401 or access token expired, attempt token refresh rotation
      const refreshed = await attemptRefresh();
      if (refreshed) {
        try {
          const retryRes = await api.get('/auth/me');
          if (retryRes?.data) {
            setUser(retryRes.data);
            return;
          }
        } catch (retryErr) {
          console.warn('Session refresh retry failed:', retryErr);
        }
      }
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, [attemptRefresh]);

  useEffect(() => {
    bootstrapSession();
  }, [bootstrapSession]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post('/auth/login', { email: email.trim(), password });
      const authenticatedUser = res?.data || res;
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.warn('Logout notification error:', e);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    return bootstrapSession();
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res?.data) {
        setUser(res.data);
        return res.data;
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  const updateUser = (updater) => {
    setUser((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        isLoading: isInitializing || isLoading,
        error,
        login,
        logout,
        refreshSession,
        refreshUser,
        updateUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

