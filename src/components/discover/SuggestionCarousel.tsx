'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { BookCard, BookDetailCard } from '@/components/book';
import type { Book } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface SuggestionCarouselProps {
  title: string;
  books: Book[];
  isLoading: boolean;
  placeholder: string;
  hasData: boolean;
  icon?: LucideIcon;
  onRefresh?: () => void;
}

export function SuggestionCarousel({
  title,
  books,
  isLoading,
  placeholder,
  hasData,
  icon: Icon,
  onRefresh,
}: SuggestionCarouselProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleBookClick = (book: Book) => {
    setSelectedBook(selectedBook?.id === book.id ? null : book);
  };

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

  if (isLoading) {
    return (
      <div className="mx-4 mb-4 bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
          {Icon && <Icon size={16} className="text-primary-500" />}
          {title}
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x-mandatory -mx-1 px-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-40 snap-start">
              <div className="aspect-[2/3] bg-gray-200 rounded-lg animate-pulse mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return null;
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
            Refresh
          </button>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x-mandatory -mx-1 px-1">
        {books.map((book) => (
          <div key={book.id} className="snap-start">
            <BookCard
              book={book}
              onClick={() => handleBookClick(book)}
              isSelected={selectedBook?.id === book.id}
              showSaveButton={false}
            />
          </div>
        ))}
      </div>
      {selectedBook && (
        <div className="mt-4 -mx-4 -mb-4">
          <BookDetailCard book={selectedBook} onClose={handleClose} />
        </div>
      )}
    </div>
  );
}
