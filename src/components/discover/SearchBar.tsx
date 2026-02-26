'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock } from 'lucide-react';
import { useUserStore } from '@/stores';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const setLastSearchQuery = useUserStore((s) => s.setLastSearchQuery);
  const addRecentSearch = useUserStore((s) => s.addRecentSearch);
  const recentSearches = useUserStore((s) => s.recentSearches);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLastSearchQuery(query.trim());
      addRecentSearch(query.trim());
      setIsFocused(false);
      router.push(`/search/${encodeURIComponent(query.trim())}`);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    setLastSearchQuery(search);
    addRecentSearch(search);
    setIsFocused(false);
    router.push(`/search/${encodeURIComponent(search)}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = isFocused && recentSearches.length > 0 && !query.trim();

  return (
    <div ref={containerRef} className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Search a title, author, genre..."
            className="w-full pl-12 pr-16 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          />
          {query.trim() && (
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 active:bg-primary-700 transition-colors"
            >
              Go
            </button>
          )}
        </div>
      </form>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            Recent searches
          </div>
          {recentSearches.map((search) => (
            <button
              key={search}
              onClick={() => handleRecentSearchClick(search)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <Clock size={16} className="text-gray-400 flex-shrink-0" />
              <span className="truncate">{search}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
