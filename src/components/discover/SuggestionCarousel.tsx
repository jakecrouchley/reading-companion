'use client';

import { useState, useRef, useEffect } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { BookCard, BookDetailCard } from '@/components/book';
import type { Book } from '@/types';
import type { LucideIcon } from 'lucide-react';

// Module-level cache that persists across component unmounts
const booksCache = new Map<string, Book[]>();

interface SuggestionCarouselProps {
  title: string;
  books: Book[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  placeholder: string;
  hasData: boolean;
  icon?: LucideIcon;
  onRefresh?: () => void;
}

export function SuggestionCarousel({
  title,
  books,
  isLoading,
  isLoadingMore = false,
  placeholder,
  hasData,
  icon: Icon,
  onRefresh,
}: SuggestionCarouselProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // Cache last displayed books using module-level Map (persists across unmounts)
  if (books.length > 0) {
    booksCache.set(title, books);
  }
  // Use incoming books if available, otherwise use cached
  const displayBooks = books.length > 0 ? books : (booksCache.get(title) || []);

  const handleBookClick = (book: Book) => {
    setSelectedBook(selectedBook?.id === book.id ? null : book);
  };

  useEffect(() => {
    if (selectedBook && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedBook]);

  const handleClose = () => {
    setSelectedBook(null);
  };

  if (!hasData) {
    return (
      <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
          {Icon && <Icon size={16} className="text-primary-500" />}
          {title}
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-gray-500 text-sm">{placeholder}</p>
        </div>
      </div>
    );
  }

  // Show full loading skeleton only on initial load (no books yet, even in cache)
  // During refresh, keep showing existing books with a loading indicator
  const isInitialLoading = isLoading && displayBooks.length === 0;

  if (isInitialLoading) {
    return (
      <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
          {Icon && <Icon size={16} className="text-primary-500" />}
          {title}
        </h3>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Sparkles size={32} className="text-primary-500 animate-pulse" />
          <p className="text-sm text-gray-500 animate-pulse">Finding recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {Icon && <Icon size={16} className="text-primary-500" />}
          {title}
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs text-gray-500 hover:text-primary-500 flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
      <div className={`flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x-mandatory -mx-1 px-1 ${isLoading ? 'opacity-50' : ''}`}>
        {displayBooks.map((book) => (
          <div key={book.id} className="snap-start">
            <BookCard
              book={book}
              onClick={() => handleBookClick(book)}
              isSelected={selectedBook?.id === book.id}
              showSaveButton={false}
            />
          </div>
        ))}
        {isLoadingMore && (
          <div className="flex-shrink-0 w-[120px] sm:w-40 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Sparkles size={24} className="animate-pulse text-primary-400" />
              <span className="text-xs text-center">Loading more...</span>
            </div>
          </div>
        )}
      </div>
      {selectedBook && (
        <div ref={detailRef} className="mt-4 -mx-4 -mb-4">
          <BookDetailCard
            book={selectedBook}
            onClose={handleClose}
            notesPlaceholder="Add a note (e.g., 'Sounds interesting - read next?')"
          />
        </div>
      )}
    </div>
  );
}
