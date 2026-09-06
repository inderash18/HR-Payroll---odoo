import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const ThemeContext = createContext({
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('odoo_theme_preference');
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'light';
  });

  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    return theme === 'system' ? getSystemTheme() : theme;
  });

  // Apply theme to DOM
  const applyThemeToDOM = useCallback((activeTheme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeTheme);
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, []);

  // Update resolvedTheme and DOM when theme changes or system preference changes
  useEffect(() => {
    const activeResolved = theme === 'system' ? getSystemTheme() : theme;
    setResolvedTheme(activeResolved);
    applyThemeToDOM(activeResolved);

    // Save to localStorage
    try {
      localStorage.setItem('odoo_theme_preference', theme);
    } catch (e) {}
  }, [theme, getSystemTheme, applyThemeToDOM]);

  // Listen to OS system theme changes
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newResolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      applyThemeToDOM(newResolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyThemeToDOM]);

  const setTheme = useCallback(async (newTheme) => {
    if (!['light', 'dark', 'system'].includes(newTheme)) return;
    setThemeState(newTheme);

    // Optionally sync with backend user preference
    try {
      await api.put('/users/preferences', { theme: newTheme });
    } catch (e) {
      // Gracefully ignore if not authenticated or offline
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, [setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
