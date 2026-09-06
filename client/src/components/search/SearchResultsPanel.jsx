import React from 'react';
import { Search, History, Trash2, ArrowUpRight, Sparkles } from 'lucide-react';
import { SearchResultGroup } from './SearchResultGroup';

export function SearchResultsPanel({
  query,
  isLoading,
  allGroups,
  flatItems,
  selectedIndex,
  recentSearches,
  onSelectSearchTerm,
  onClearRecent,
  onSelect,
}) {
  const hasResults = flatItems && flatItems.length > 0;
  const isQueryEmpty = !query || query.trim().length === 0;

  return (
    <div
      className="search-results-dropdown absolute left-0 right-0 mt-2 bg-[var(--surface)] border border-[var(--border-strong)] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[520px] flex flex-col animate-in fade-in zoom-in-95 duration-150"
      style={{
        minWidth: '380px',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.2), 0 0 0 1px var(--border)',
      }}
    >
      <div className="overflow-y-auto p-2 divide-y divide-[var(--border)] max-h-[460px]">
        {/* Recent Searches Header (if query is empty and recent searches exist) */}
        {isQueryEmpty && recentSearches && recentSearches.length > 0 && (
          <div className="py-2 px-1">
            <div className="flex items-center justify-between px-2 mb-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <History size={12} />
                <span>Recent Searches</span>
              </div>
              <button
                type="button"
                onClick={onClearRecent}
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--danger)] bg-transparent border-none cursor-pointer p-0.5 flex items-center gap-1 transition-colors"
              >
                <Trash2 size={11} />
                <span>Clear</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 px-2">
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectSearchTerm(term)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--surface-soft)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] text-[var(--text-secondary)] border border-[var(--border)] transition-all cursor-pointer"
                >
                  <Search size={11} className="opacity-60" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grouped Search Results */}
        {allGroups.map((group) => (
          <SearchResultGroup
            key={group.type}
            group={group}
            flatItems={flatItems}
            selectedIndex={selectedIndex}
            onSelect={onSelect}
          />
        ))}

        {/* Empty State */}
        {!hasResults && !isLoading && !isQueryEmpty && (
          <div className="p-8 text-center text-[var(--text-muted)]">
            <div className="w-10 h-10 rounded-full bg-[var(--surface-soft)] text-[var(--text-muted)] flex items-center justify-center mx-auto mb-2.5">
              <Search size={20} className="opacity-60" />
            </div>
            <p className="text-xs font-bold text-[var(--text-primary)]">
              No matching results found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-[11px] mt-1 text-[var(--text-muted)] max-w-[280px] mx-auto">
              Check spelling or try searching for people, departments, payroll batches, payslips, or leave requests.
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation Hints */}
      <div className="bg-[var(--surface-soft)] px-3.5 py-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[9px]">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[9px]">↓</kbd>
            <span>Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[9px]">↵</kbd>
            <span>Open</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[9px]">ESC</kbd>
            <span>Close</span>
          </span>
        </div>
        <span className="font-semibold text-[var(--primary)] flex items-center gap-1">
          <Sparkles size={11} />
          <span>Odoo Enterprise Search</span>
        </span>
      </div>
    </div>
  );
}
