import React from 'react';
import { Search, X, Loader2, Command } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import { SearchResultsPanel } from './SearchResultsPanel';

export function GlobalSearch() {
  const {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    isMobileOpen,
    setIsMobileOpen,
    selectedIndex,
    isLoading,
    allGroups,
    flatItems,
    recentSearches,
    clearRecentSearches,
    handleSelect,
    handleInputKeyDown,
    inputRef,
    mobileInputRef,
    containerRef,
  } = useGlobalSearch();

  return (
    <>
      {/* =========================================================
          DESKTOP & TABLET GLOBAL SEARCH BAR
          ========================================================= */}
      <div
        className="relative w-full max-w-[420px] hidden md:block"
        ref={containerRef}
        id="odoo-desktop-global-search"
      >
        <div
          className={`search-pill-container flex items-center gap-2.5 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-text ${
            isOpen
              ? 'bg-[var(--surface)] border-[var(--primary)] shadow-[0_0_0_3px_rgba(139,79,103,0.18)]'
              : 'bg-[var(--surface)] hover:bg-[var(--surface)]'
          }`}
          style={{
            border: isOpen
              ? '1.5px solid var(--primary)'
              : '1px solid rgba(139, 79, 103, 0.45)',
            minHeight: '38px',
          }}
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
        >
          <Search
            size={16}
            style={{ color: 'var(--text-muted)' }}
            className="shrink-0"
          />

          <input
            ref={inputRef}
            type="text"
            id="global-search-input"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
            aria-label="Search across Odoo"
            placeholder="Search across Odoo..."
            autoComplete="off"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            className="w-full bg-transparent border-none outline-none text-xs md:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-normal"
          />

          {isLoading ? (
            <Loader2
              size={15}
              className="animate-spin text-[var(--primary)] shrink-0"
            />
          ) : query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={(e) => {
                e.stopPropagation();
                setQuery('');
                inputRef.current?.focus();
              }}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer p-0.5"
            >
              <X size={14} />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 text-[10px] font-semibold text-[var(--text-muted)] bg-[var(--surface-soft)] border border-[var(--border)] px-1.5 py-0.5 rounded shadow-2xs">
              <Command size={10} />K
            </kbd>
          )}
        </div>

        {/* Desktop Search Results Dropdown */}
        {isOpen && (
          <SearchResultsPanel
            query={query}
            isLoading={isLoading}
            allGroups={allGroups}
            flatItems={flatItems}
            selectedIndex={selectedIndex}
            recentSearches={recentSearches}
            onSelectSearchTerm={(term) => {
              setQuery(term);
              setIsOpen(true);
            }}
            onClearRecent={clearRecentSearches}
            onSelect={handleSelect}
          />
        )}
      </div>

      {/* =========================================================
          MOBILE SEARCH TRIGGER BUTTON
          ========================================================= */}
      <div className="block md:hidden">
        <button
          type="button"
          aria-label="Open search"
          id="btn-mobile-search-trigger"
          className="topbar-icon-btn"
          onClick={() => {
            setIsMobileOpen(true);
            setTimeout(() => mobileInputRef.current?.focus(), 100);
          }}
        >
          <Search size={19} />
        </button>
      </div>

      {/* =========================================================
          MOBILE FULL-SCREEN SEARCH OVERLAY
          ========================================================= */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-[var(--surface)] z-50 flex flex-col animate-in fade-in duration-200">
          {/* Top Bar with Input */}
          <div className="flex items-center gap-2 p-3 border-b border-[var(--border)] bg-[var(--surface-soft)]">
            <div
              className="flex-1 flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--surface)]"
              style={{ border: '1.5px solid var(--primary)' }}
            >
              <Search size={16} className="text-[var(--primary)] shrink-0" />
              <input
                ref={mobileInputRef}
                type="text"
                placeholder="Search across Odoo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)]"
              />
              {isLoading && (
                <Loader2
                  size={14}
                  className="animate-spin text-[var(--primary)] shrink-0"
                />
              )}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-[var(--text-muted)] bg-transparent border-none cursor-pointer"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-3">
            <SearchResultsPanel
              query={query}
              isLoading={isLoading}
              allGroups={allGroups}
              flatItems={flatItems}
              selectedIndex={selectedIndex}
              recentSearches={recentSearches}
              onSelectSearchTerm={(term) => setQuery(term)}
              onClearRecent={clearRecentSearches}
              onSelect={handleSelect}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default GlobalSearch;
