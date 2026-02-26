'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Bookmark } from 'lucide-react';
import { Badge, StarRating } from '@/components/ui';
import { useSavedBooksStore } from '@/stores';
import { useOpenLibraryRatings } from '@/hooks';
import type { Book, ReadingStatus } from '@/types';

interface BookDetailCardProps {
  book: Book;
  onClose?: () => void;
  notesPlaceholder?: string;
}

const OPEN_LIBRARY_MIN_RATINGS = 10;

export function BookDetailCard({ book, onClose, notesPlaceholder }: BookDetailCardProps) {
  const [notes, setNotes] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const saveBook = useSavedBooksStore((s) => s.saveBook);
  const updateBook = useSavedBooksStore((s) => s.updateBook);
  const savedBook = useSavedBooksStore((s) => s.savedBooks.find((sb) => sb.bookId === book.id));
  const isSaved = !!savedBook;

  // Fetch Open Library ratings
  const { data: openLibraryRatings, isLoading: isLoadingRatings } = useOpenLibraryRatings(book.isbn);

  // Only show ratings from Open Library with sufficient count
  const displayRating = openLibraryRatings && openLibraryRatings.count >= OPEN_LIBRARY_MIN_RATINGS
    ? { average: openLibraryRatings.average, count: openLibraryRatings.count }
    : null;

  const handleSave = () => {
    if (!isSaved) {
      saveBook(book, notes.trim() || undefined);
    }
  };

  const handleStatusChange = (status: ReadingStatus) => {
    if (savedBook) {
      updateBook(savedBook.id, { status });
    }
  };

  const handleRatingChange = (rating: number) => {
    if (savedBook) {
      updateBook(savedBook.id, { userRating: rating });
    }
  };

  const handleNotesChange = (newNotes: string) => {
    if (savedBook) {
      updateBook(savedBook.id, { notes: newNotes.trim() || undefined });
    }
  };

  const mainGenres = book.categories?.slice(0, 3) || [];

  const handleToggleDescription = () => {
    const isCollapsing = showFullDescription;
    setShowFullDescription(!showFullDescription);

    // Scroll card into view when collapsing description
    if (isCollapsing && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  return (
    <div ref={cardRef} className="bg-gray-50 p-4 mx-4 rounded-xl mb-4">
      <div className="flex gap-4">
        <div className="relative w-24 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {book.thumbnail ? (
            <Image
              src={book.thumbnail}
              alt={book.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center">
              No Cover
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{book.title}</h2>
          <p className="text-gray-600 mt-1">
            {book.authors?.join(', ') || 'Unknown Author'}
          </p>
          {book.publishedDate && (
            <p className="text-sm text-gray-500 mt-1">
              {book.publishedDate.split('-')[0]}
            </p>
          )}
          <div className="flex flex-wrap gap-1 mt-2">
            {mainGenres.map((genre) => (
              <Badge key={genre} label={genre} size="sm" />
            ))}
          </div>
          <div className="mt-2">
            {isLoadingRatings ? (
              <p className="text-xs text-gray-400">Loading ratings...</p>
            ) : displayRating ? (
              <div className="flex items-center gap-1.5">
                <StarRating rating={displayRating.average} size={14} showValue />
                <span className="text-xs text-gray-400">
                  ({displayRating.count.toLocaleString()} {displayRating.count === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No ratings available</p>
            )}
          </div>
        </div>
      </div>

      {book.description && (
        <div className="mt-4">
          <p
            className={`text-gray-700 leading-relaxed ${
              !showFullDescription ? 'line-clamp-3' : ''
            }`}
          >
            {book.description}
          </p>
          {book.description.length > 150 && (
            <button
              onClick={handleToggleDescription}
              className="text-primary-500 text-sm mt-1 hover:underline"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {isSaved ? (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Reading Status
            </label>
            <div className="flex flex-wrap gap-2">
              {(['not_started', 'reading', 'read', 'quit'] as ReadingStatus[]).map((status) => {
                const isSelected = savedBook?.status === status;
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
              rating={savedBook?.userRating || 0}
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
              placeholder={notesPlaceholder || "Add a note (e.g., 'Anna recommended this at dinner')"}
              defaultValue={savedBook?.notes || ''}
              onBlur={(e) => handleNotesChange(e.target.value)}
              className="w-full p-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none text-sm"
              rows={2}
            />
          </div>
        </div>
      ) : (
        <>
          <textarea
            placeholder={notesPlaceholder || "Add a note (e.g., 'Anna recommended this at dinner')"}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full mt-4 p-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={2}
          />
          <div className="mt-4">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              <Bookmark size={18} />
              Save to Reading List
            </button>
          </div>
        </>
      )}
    </div>
  );
}
