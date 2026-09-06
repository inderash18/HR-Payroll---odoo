import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Reusable local table search input
 * @param {string} value - Controlled search value
 * @param {function} onChange - Callback triggered when debounced value changes
 * @param {string} placeholder - Placeholder text
 * @param {boolean} isLoading - Loading state indicator
 * @param {string} id - Unique HTML id
 */
export function LocalTableSearch({
  value = '',
  onChange,
  placeholder = 'Search records...',
  isLoading = false,
  id = 'local-table-search',
}) {
  const [internalValue, setInternalValue] = useState(value);
  const debouncedValue = useDebounce(internalValue, 300);

  // Sync internal state if prop value changes externally (e.g. url query param or clear button)
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Trigger parent onChange only when debounced value changes
  useEffect(() => {
    if (onChange && debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      onChange('');
    }
  };

  return (
    <div className="relative flex items-center min-w-[240px] max-w-[340px] w-full">
      <div
        className="flex items-center gap-2 w-full px-3 py-1.5 rounded-xl transition-all duration-150 bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_2px_rgba(139,79,103,0.15)]"
        style={{ minHeight: '36px' }}
      >
        <Search size={15} className="text-[var(--text-muted)] shrink-0" />
        <input
          id={id}
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal"
        />
        {isLoading ? (
          <Loader2 size={13} className="animate-spin text-[var(--primary)] shrink-0" />
        ) : internalValue ? (
          <button
            type="button"
            aria-label="Clear table search"
            onClick={handleClear}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer p-0.5"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default LocalTableSearch;
