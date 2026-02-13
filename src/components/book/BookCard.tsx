'use client';

import Image from 'next/image';
import { useSavedBooksStore } from '@/stores';
import { Button, Badge, StarRating } from '@/components/ui';
import { Bookmark, Check } from 'lucide-react';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
  isSelected?: boolean;
  showSaveButton?: boolean;
}

export function BookCard({ book, onClick, isSelected, showSaveButton = true }: BookCardProps) {
  const saveBook = useSavedBooksStore((s) => s.saveBook);
  const isSaved = useSavedBooksStore((s) => s.savedBooks.some((sb) => sb.bookId === book.id));

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveBook(book);
  };

  const mainGenre = book.categories?.[0] || 'Fiction';

  return (
    <div
      className="flex-shrink-0 w-40 cursor-pointer group"
      onClick={onClick}
    >
      <div className={`relative aspect-[2/3] mb-2 rounded-lg overflow-hidden bg-gray-100 ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}>
        {book.thumbnail ? (
          <Image
            src={book.thumbnail}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
            sizes="160px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-2">
            No Cover
          </div>
        )}
        {showSaveButton && (
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`absolute top-1 right-1 p-2.5 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
              isSaved
                ? 'bg-green-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white active:bg-primary-600'
            }`}
          >
            {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>
      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1 text-center">
        {book.title}
      </h3>
      <p className="text-xs text-gray-500 line-clamp-1 mb-1 text-center">
        {book.authors?.join(', ') || 'Unknown Author'}
      </p>
      <div className="flex items-center justify-center gap-2">
        <Badge label={mainGenre} size="sm" />
        {book.averageRating && (
          <StarRating rating={book.averageRating} size={10} />
        )}
      </div>
    </div>
  );
}
