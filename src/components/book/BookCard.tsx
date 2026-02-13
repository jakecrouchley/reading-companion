'use client';

import Image from 'next/image';
import { useSavedBooksStore } from '@/stores';
import { Button, Badge, StarRating } from '@/components/ui';
import { Bookmark, Check } from 'lucide-react';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
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
      <div className="relative aspect-[2/3] mb-2 rounded-lg overflow-hidden bg-gray-100">
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
        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
            isSaved
              ? 'bg-green-500 text-white'
              : 'bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white'
          }`}
        >
          {isSaved ? <Check size={14} /> : <Bookmark size={14} />}
        </button>
      </div>
      <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
        {book.title}
      </h3>
      <p className="text-xs text-gray-500 line-clamp-1 mb-1">
        {book.authors?.join(', ') || 'Unknown Author'}
      </p>
      <div className="flex items-center gap-2">
        <Badge label={mainGenre} size="sm" />
        {book.averageRating && (
          <StarRating rating={book.averageRating} size={10} />
        )}
      </div>
    </div>
  );
}
