'use client';

import { useUserStore } from '@/stores';
import type { ReadingStatus } from '@/types';

type FilterOption = ReadingStatus | 'all';

const filterOptions: { value: FilterOption; label: string; activeColor: string; inactiveColor: string }[] = [
  { value: 'all', label: 'All', activeColor: 'bg-gray-500 text-white hover:bg-gray-600', inactiveColor: 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200' },
  { value: 'not_started', label: 'Not Started', activeColor: 'bg-yellow-500 text-white hover:bg-yellow-600', inactiveColor: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200' },
  { value: 'reading', label: 'Reading', activeColor: 'bg-blue-500 text-white hover:bg-blue-600', inactiveColor: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' },
  { value: 'read', label: 'Read', activeColor: 'bg-green-500 text-white hover:bg-green-600', inactiveColor: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200' },
  { value: 'quit', label: 'Quit', activeColor: 'bg-red-500 text-white hover:bg-red-600', inactiveColor: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' },
];

export function FilterBar() {
  const filterPreference = useUserStore((s) => s.filterPreference);
  const setFilterPreference = useUserStore((s) => s.setFilterPreference);

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterPreference(option.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors snap-start ${
              filterPreference === option.value
                ? option.activeColor
                : option.inactiveColor
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
