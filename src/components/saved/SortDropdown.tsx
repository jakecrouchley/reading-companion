'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useUserStore } from '@/stores';
import type { SortOption } from '@/types';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'date_saved', label: 'Date Saved' },
  { value: 'rating', label: 'Rating' },
];

export function SortDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortPreference = useUserStore((s) => s.sortPreference);
  const sortDirection = useUserStore((s) => s.sortDirection);
  const setSortPreference = useUserStore((s) => s.setSortPreference);
  const setSortDirection = useUserStore((s) => s.setSortDirection);

  const currentSort = sortOptions.find((opt) => opt.value === sortPreference);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortChange = (value: SortOption) => {
    if (value === sortPreference) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortPreference(value);
      setSortDirection('desc');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-w-0"
      >
        <span className="truncate max-w-[100px] sm:max-w-none">
          <span className="hidden sm:inline">Sort: </span>
          {currentSort?.label}
        </span>
        {sortDirection === 'asc' ? <ArrowUp size={14} className="flex-shrink-0" /> : <ArrowDown size={14} className="flex-shrink-0" />}
        <ChevronDown size={14} className={`flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSortChange(option.value)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center justify-between ${
                sortPreference === option.value ? 'text-primary-500 font-medium' : 'text-gray-700'
              }`}
            >
              {option.label}
              {sortPreference === option.value && (
                sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
