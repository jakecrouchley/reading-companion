'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Settings } from 'lucide-react';
import { useSavedBooksStore, useUserStore } from '@/stores';
import { SavedBookCard } from '@/components/book';
import { FilterBar, SortDropdown } from '@/components/saved';
import type { SavedBook } from '@/types';

export default function SavedPage() {
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const savedBooks = useSavedBooksStore((s) => s.savedBooks);
  const filterPreference = useUserStore((s) => s.filterPreference);
  const sortPreference = useUserStore((s) => s.sortPreference);
  const sortDirection = useUserStore((s) => s.sortDirection);

  const handleToggleExpand = useCallback((bookId: string) => {
    setExpandedBookId((current) => (current === bookId ? null : bookId));
  }, []);

  useEffect(() => {
    if (!expandedBookId) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      const clickedCard = target.closest('[data-book-card]');
      if (!clickedCard) {
        setExpandedBookId(null);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [expandedBookId]);

  const filteredAndSortedBooks = useMemo(() => {
    // Create array with original indices to use as tiebreaker for date sorting
    let books = savedBooks.map((book, index) => ({ book, originalIndex: index }));

    // Filter
    if (filterPreference !== 'all') {
      books = books.filter((item) => item.book.status === filterPreference);
    }

    // Sort
    books.sort((a, b) => {
      let comparison = 0;

      switch (sortPreference) {
        case 'date_saved':
          // Primary: compare timestamps
          comparison = new Date(b.book.savedAt).getTime() - new Date(a.book.savedAt).getTime();
          // Tiebreaker: use original array order (newer books are prepended, so lower index = newer)
          if (comparison === 0) {
            comparison = a.originalIndex - b.originalIndex;
          }
          break;
        case 'rating':
          comparison = (b.book.userRating || 0) - (a.book.userRating || 0);
          break;
      }

      return sortDirection === 'asc' ? -comparison : comparison;
    });

    return books.map((item) => item.book);
  }, [savedBooks, filterPreference, sortPreference, sortDirection]);

  return (
    <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="w-10" />
        <h1 className="text-2xl font-bold text-gray-900">Saved</h1>
        <Link
          href="/settings"
          className="p-2 -mr-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
        >
          <Settings size={24} className="text-gray-600" />
        </Link>
      </header>

      {savedBooks.length === 0 ? (
        <div className="px-4 py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <BookOpen size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">No saved books yet</h2>
          <p className="text-gray-500">
            Search for books and save them to build your reading list.
          </p>
        </div>
      ) : (
        <>
          <div className="px-4 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <FilterBar />
            <SortDropdown />
          </div>

          <div className="px-4 space-y-3 pb-4">
            {filteredAndSortedBooks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500">No books match your filter.</p>
              </div>
            ) : (
              filteredAndSortedBooks.map((book) => (
                <SavedBookCard
                  key={book.id}
                  savedBook={book}
                  isExpanded={expandedBookId === book.id}
                  onToggle={() => handleToggleExpand(book.id)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
