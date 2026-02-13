'use client';

import { useUserStore } from '@/stores';
import type { ReadingStatus } from '@/types';

type FilterOption = ReadingStatus | 'all';

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
];

export function FilterBar() {
  const filterPreference = useUserStore((s) => s.filterPreference);
  const setFilterPreference = useUserStore((s) => s.setFilterPreference);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x-mandatory">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setFilterPreference(option.value)}
          className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-colors snap-start ${
            filterPreference === option.value
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
