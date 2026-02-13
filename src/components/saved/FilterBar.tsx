'use client';

import { useUserStore } from '@/stores';
import type { ReadingStatus } from '@/types';

type FilterOption = ReadingStatus | 'all';

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'not_started', label: 'Not Started' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
];

export function FilterBar() {
  const filterPreference = useUserStore((s) => s.filterPreference);
  const setFilterPreference = useUserStore((s) => s.setFilterPreference);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => setFilterPreference(option.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filterPreference === option.value
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
