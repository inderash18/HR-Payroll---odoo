import React from 'react';
import { SearchResultItem } from './SearchResultItem';

export function SearchResultGroup({
  group,
  flatItems,
  selectedIndex,
  onSelect,
}) {
  if (!group || !group.results || group.results.length === 0) return null;

  return (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase flex items-center justify-between">
        <span>{group.label}</span>
        <span className="text-[9px] font-normal text-[var(--text-muted)] opacity-75">
          {group.results.length} item{group.results.length === 1 ? '' : 's'}
        </span>
      </div>
      <div className="flex flex-col gap-0.5 mt-0.5">
        {group.results.map((item) => {
          const itemIndex = flatItems.findIndex(
            (f) => f.id === item.id && f.groupType === group.type
          );
          const isSelected = selectedIndex === itemIndex;

          return (
            <SearchResultItem
              key={`${group.type}-${item.id}`}
              item={item}
              isSelected={isSelected}
              onClick={() => onSelect(item)}
            />
          );
        })}
      </div>
    </div>
  );
}
