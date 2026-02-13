'use client';

import { BookCard } from '@/components/book';
import type { Book } from '@/types';

interface SuggestionCarouselProps {
  title: string;
  books: Book[];
  isLoading: boolean;
  placeholder: string;
  hasData: boolean;
}

export function SuggestionCarousel({
  title,
  books,
  isLoading,
  placeholder,
  hasData,
}: SuggestionCarouselProps) {
  if (!hasData) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 px-4 mb-3">{title}</h3>
        <div className="px-4">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-500 text-sm">{placeholder}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-600 px-4 mb-3">{title}</h3>
        <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-40">
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
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-600 px-4 mb-3">{title}</h3>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
