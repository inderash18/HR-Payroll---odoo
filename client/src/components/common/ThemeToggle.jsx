import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export default function ThemeToggle({ className = '', variant = 'dropdown' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'button-group') {
    return (
      <div className={`inline-flex items-center p-1 rounded-xl bg-[var(--surface-soft)] border border-[var(--border)] gap-1 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'light'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Sun size={14} />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'dark'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Moon size={14} />
          <span>Dark</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
            theme === 'system'
              ? 'bg-[var(--primary)] text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
          }`}
        >
          <Laptop size={14} />
          <span>System</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all duration-200 shadow-sm"
        title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
        aria-label="Toggle theme"
      >
        {resolvedTheme === 'dark' ? (
          <Moon size={17} className="text-[var(--primary)]" />
        ) : (
          <Sun size={17} className="text-[var(--primary)]" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 py-1.5 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-lg z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
            Appearance
          </div>
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
              theme === 'light'
                ? 'text-[var(--primary)] bg-[var(--primary-soft)] font-semibold'
                : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun size={14} />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
              theme === 'dark'
                ? 'text-[var(--primary)] bg-[var(--primary-soft)] font-semibold'
                : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon size={14} />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check size={14} />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
              theme === 'system'
                ? 'text-[var(--primary)] bg-[var(--primary-soft)] font-semibold'
                : 'text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop size={14} />
              <span>System</span>
            </div>
            {theme === 'system' && <Check size={14} />}
          </button>
        </div>
      )}
    </div>
  );
}
