'use client';

import Image from 'next/image';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Badge, StarRating } from '@/components/ui';
import { useSavedBooksStore } from '@/stores';
import type { Book } from '@/types';

interface BookListItemProps {
  book: Book;
  onPress: () => void;
  isExpanded: boolean;
}

export function BookListItem({ book, onPress, isExpanded }: BookListItemProps) {
  const saveBook = useSavedBooksStore((s) => s.saveBook);
  const isSaved = useSavedBooksStore((s) => s.savedBooks.some((sb) => sb.bookId === book.id));

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveBook(book);
  };

  const mainGenre = book.categories?.[0] || 'Fiction';

  return (
    <div
      onClick={onPress}
      className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
        isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
      }`}
    >
      <div className="flex gap-3">
        <div className="relative w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {book.thumbnail ? (
            <Image
              src={book.thumbnail}
              alt={book.title}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
              No Cover
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {book.authors?.join(', ') || 'Unknown Author'}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge label={mainGenre} size="sm" />
            {book.averageRating && (
              <StarRating rating={book.averageRating} size={12} />
            )}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between">
          {isExpanded ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
          <Button
            onClick={handleSave}
            variant={isSaved ? 'ghost' : 'primary'}
            size="sm"
            disabled={isSaved}
          >
            {isSaved ? 'Saved' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  );
}
