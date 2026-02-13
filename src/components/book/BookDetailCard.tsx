'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bookmark, Check } from 'lucide-react';
import { Button, Badge, StarRating } from '@/components/ui';
import { useSavedBooksStore } from '@/stores';
import type { Book } from '@/types';

interface BookDetailCardProps {
  book: Book;
  onClose?: () => void;
}

export function BookDetailCard({ book, onClose }: BookDetailCardProps) {
  const [notes, setNotes] = useState('');
  const [showFullDescription, setShowFullDescription] = useState(false);

  const saveBook = useSavedBooksStore((s) => s.saveBook);
  const isSaved = useSavedBooksStore((s) => s.savedBooks.some((sb) => sb.bookId === book.id));

  const handleSave = () => {
    if (!isSaved) {
      saveBook(book, notes.trim() || undefined);
      onClose?.();
    }
  };

  const mainGenres = book.categories?.slice(0, 3) || [];

  return (
    <div className="bg-gray-50 p-4 mx-4 rounded-xl mb-4">
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
          {book.averageRating && (
            <div className="mt-2">
              <StarRating rating={book.averageRating} size={16} showValue />
            </div>
          )}
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
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-primary-500 text-sm mt-1 hover:underline"
            >
              {showFullDescription ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {!isSaved && (
        <textarea
          placeholder="Add a note (e.g., 'Anna recommended this at dinner')"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full mt-4 p-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          rows={2}
        />
      )}

      {!isSaved && (
        <div className="mt-4">
          <Button
            onClick={handleSave}
            variant="primary"
            className="w-full"
            icon={<Bookmark size={18} />}
          >
            Save to Reading List
          </Button>
        </div>
      )}
    </div>
  );
}
