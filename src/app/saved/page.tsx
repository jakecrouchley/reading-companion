'use client';

import { useMemo } from 'react';
import { BookOpen } from 'lucide-react';
import { useSavedBooksStore, useUserStore } from '@/stores';
import { SavedBookCard } from '@/components/book';
import { FilterBar, SortDropdown } from '@/components/saved';
import type { SavedBook } from '@/types';

export default function SavedPage() {
  const savedBooks = useSavedBooksStore((s) => s.savedBooks);
  const filterPreference = useUserStore((s) => s.filterPreference);
  const sortPreference = useUserStore((s) => s.sortPreference);
  const sortDirection = useUserStore((s) => s.sortDirection);

  const filteredAndSortedBooks = useMemo(() => {
    let books = [...savedBooks];

    // Filter
    if (filterPreference !== 'all') {
      books = books.filter((book) => book.status === filterPreference);
    }

    // Sort
    books.sort((a, b) => {
      let comparison = 0;

      switch (sortPreference) {
        case 'date_saved':
          comparison = new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
          break;
        case 'title':
          comparison = a.book.title.localeCompare(b.book.title);
          break;
        case 'author':
          const authorA = a.book.authors?.[0] || '';
          const authorB = b.book.authors?.[0] || '';
          comparison = authorA.localeCompare(authorB);
          break;
        case 'rating':
          comparison = (b.userRating || 0) - (a.userRating || 0);
          break;
      }

      return sortDirection === 'asc' ? -comparison : comparison;
    });

    return books;
  }, [savedBooks, filterPreference, sortPreference, sortDirection]);

  return (
    <div className="max-w-lg mx-auto">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Saved</h1>
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
          <div className="px-4 pb-4 flex items-center justify-between gap-4">
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
                <SavedBookCard key={book.id} savedBook={book} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
