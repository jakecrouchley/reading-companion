'use client';

import { useMemo } from 'react';
import { SearchBar, SuggestionCarousel } from '@/components/discover';
import { useSavedBooksStore } from '@/stores';
import { useSuggestions } from '@/hooks';

export default function DiscoverPage() {
  const savedBooks = useSavedBooksStore((s) => s.savedBooks);
  const completedBooks = useMemo(
    () => savedBooks.filter((book) => book.status === 'completed'),
    [savedBooks]
  );
  const fiveStarBooks = useMemo(
    () => savedBooks.filter((book) => book.userRating === 5),
    [savedBooks]
  );

  const {
    authorSuggestions,
    genreSuggestions,
    ratingSuggestions,
    isLoading,
  } = useSuggestions();

  const hasSavedBooks = savedBooks.length > 0;
  const hasCompletedBooks = completedBooks.length > 0;
  const hasFiveStarBooks = fiveStarBooks.length > 0;

  return (
    <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
      </header>

      <div className="px-4 pb-4">
        <SearchBar />
      </div>

      <div className="py-4">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider px-4 mb-4">
          AI Suggestions
        </h2>

        <SuggestionCarousel
          title="Based on authors of books you've saved"
          books={authorSuggestions}
          isLoading={isLoading}
          placeholder="Save some books so I can learn what to recommend!"
          hasData={hasSavedBooks}
        />

        <SuggestionCarousel
          title="Based on genres of books you've read"
          books={genreSuggestions}
          isLoading={isLoading}
          placeholder="Mark books as completed to get genre-based recommendations!"
          hasData={hasCompletedBooks}
        />

        <SuggestionCarousel
          title="Based on books you've rated 5 stars"
          books={ratingSuggestions}
          isLoading={isLoading}
          placeholder="Rate some books 5 stars to get similar recommendations!"
          hasData={hasFiveStarBooks}
        />
      </div>
    </div>
  );
}
