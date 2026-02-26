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
  isExpanded: boolean;
  onToggle: () => void;
}

export function SavedBookCard({ savedBook, isExpanded, onToggle }: SavedBookCardProps) {
  const [notes, setNotes] = useState(savedBook.notes || '');
  const updateBook = useSavedBooksStore((s) => s.updateBook);
  const deleteBook = useSavedBooksStore((s) => s.deleteBook);

  const handleStatusChange = (status: ReadingStatus) => {
    updateBook(savedBook.id, { status });
  };

  const handleNotesBlur = () => {
    const trimmedNotes = notes.trim();
    if (trimmedNotes !== (savedBook.notes || '')) {
      updateBook(savedBook.id, { notes: trimmedNotes || undefined });
    }
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
    <div data-book-card className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
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
              <div className="flex flex-wrap gap-2">
                {(['not_started', 'reading', 'read', 'quit'] as ReadingStatus[]).map((status) => {
                  const isSelected = savedBook.status === status;
                  const statusStyles: Record<ReadingStatus, { active: string; inactive: string }> = {
                    not_started: {
                      active: 'bg-yellow-500 text-white hover:bg-yellow-600',
                      inactive: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200',
                    },
                    reading: {
                      active: 'bg-blue-500 text-white hover:bg-blue-600',
                      inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200',
                    },
                    read: {
                      active: 'bg-green-500 text-white hover:bg-green-600',
                      inactive: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200',
                    },
                    quit: {
                      active: 'bg-red-500 text-white hover:bg-red-600',
                      inactive: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200',
                    },
                  };
                  const statusLabels: Record<ReadingStatus, string> = {
                    not_started: 'Not Started',
                    reading: 'Reading',
                    read: 'Read',
                    quit: 'Quit',
                  };
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        isSelected ? statusStyles[status].active : statusStyles[status].inactive
                      }`}
                    >
                      {statusLabels[status]}
                    </button>
                  );
                })}
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

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Notes
              </label>
              <textarea
                placeholder="Add a note (e.g., 'Anna recommended this at dinner')"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                onClick={(e) => e.stopPropagation()}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
                rows={2}
              />
            </div>

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
