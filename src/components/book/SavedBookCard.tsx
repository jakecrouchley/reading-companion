'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Badge, StarRating, StatusBadge } from '@/components/ui';
import { useSavedBooksStore } from '@/stores';
import type { SavedBook, ReadingStatus } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface SavedBookCardProps {
  savedBook: SavedBook;
}

export function SavedBookCard({ savedBook }: SavedBookCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const updateBook = useSavedBooksStore((s) => s.updateBook);
  const deleteBook = useSavedBooksStore((s) => s.deleteBook);

  const handleStatusChange = (status: ReadingStatus) => {
    updateBook(savedBook.id, { status });
  };

  const handleRatingChange = (rating: number) => {
    updateBook(savedBook.id, { userRating: rating });
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove "${savedBook.book.title}" from your reading list?`)) {
      deleteBook(savedBook.id);
    }
  };

  const { book } = savedBook;
  const mainGenre = book.categories?.[0] || 'Fiction';
  const savedDate = new Date(savedBook.savedAt);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
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
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-gray-900 line-clamp-2">{book.title}</h3>
              {isExpanded ? (
                <ChevronUp size={20} className="text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown size={20} className="text-gray-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {book.authors?.join(', ') || 'Unknown Author'}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={savedBook.status} />
              <Badge label={mainGenre} size="sm" />
            </div>
            {savedBook.userRating && (
              <div className="mt-2">
                <StarRating rating={savedBook.userRating} size={14} />
              </div>
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Reading Status
              </label>
              <div className="flex gap-2">
                {(['not_started', 'reading', 'completed'] as ReadingStatus[]).map((status) => (
                  <Button
                    key={status}
                    variant={savedBook.status === status ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                  >
                    {status === 'not_started' ? 'Not Started' : status === 'reading' ? 'Reading' : 'Completed'}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Your Rating
              </label>
              <StarRating
                rating={savedBook.userRating || 0}
                size={24}
                interactive
                onChange={handleRatingChange}
              />
            </div>

            {savedBook.notes && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Notes
                </label>
                <p className="text-sm text-gray-600">{savedBook.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-gray-400">
                Saved {formatDistanceToNow(savedDate, { addSuffix: true })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                icon={<Trash2 size={16} />}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
