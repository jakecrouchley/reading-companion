'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useBookSearch } from '@/hooks';
import { useUserStore } from '@/stores';
import { BookListItem, BookDetailCard } from '@/components/book';

export default function SearchResultsPage() {
  const params = useParams();
  const router = useRouter();
  const query = decodeURIComponent(params.query as string);
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const setLastSearchQuery = useUserStore((s) => s.setLastSearchQuery);

  const { data: books, isLoading, error } = useBookSearch(query);

  const handleBookPress = (bookId: string) => {
    setExpandedBookId(expandedBookId === bookId ? null : bookId);
  };

  const handleBack = () => {
    setLastSearchQuery(null);
    router.push('/');
  };

  return (
    <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-4 pt-6 pb-4 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2.5 -ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Search Results</h1>
          <p className="text-sm text-gray-500">for "{query}"</p>
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-primary-500" />
        </div>
      )}

      {error && (
        <div className="px-4 py-8 text-center">
          <p className="text-red-500">Failed to search books. Please try again.</p>
        </div>
      )}

      {!isLoading && books && books.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-gray-500">No books found for "{query}"</p>
        </div>
      )}

      {books && books.length > 0 && (
        <div className="bg-white">
          {books.map((book) => (
            <div key={book.id}>
              <BookListItem
                book={book}
                onPress={() => handleBookPress(book.id)}
                isExpanded={expandedBookId === book.id}
              />
              {expandedBookId === book.id && (
                <BookDetailCard
                  book={book}
                  onClose={() => setExpandedBookId(null)}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
