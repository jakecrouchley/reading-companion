'use client';

import { useMemo } from 'react';
import { SearchBar, SuggestionCarousel } from '@/components/discover';
import { useSavedBooksStore } from '@/stores';
import { useSuggestions } from '@/hooks';
import { PenTool, BookOpen, Star } from 'lucide-react';

export default function DiscoverPage() {
  const savedBooks = useSavedBooksStore((s) => s.savedBooks);
  const readBooks = useMemo(
    () => savedBooks.filter((book) => book.status === 'read'),
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
    refetch,
  } = useSuggestions();

  const hasSavedBooks = savedBooks.length > 0;
  const hasReadBooks = readBooks.length > 0;
  const hasFiveStarBooks = fiveStarBooks.length > 0;

  return (
    <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-4 pt-6 pb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
      </header>

      <div className="px-4 pb-4">
        <SearchBar />
      </div>

      <div className="py-4">
        <h2 className="text-lg font-semibold text-gray-900 px-4 mb-4 text-center flex items-center justify-center gap-2">
          <span className="text-primary-500">✨</span>
          AI Suggestions
        </h2>

        <SuggestionCarousel
          title="Based on authors you like"
          books={authorSuggestions}
          isLoading={isLoading}
          placeholder="Save some books so I can learn what to recommend!"
          hasData={hasSavedBooks}
          icon={PenTool}
          onRefresh={refetch}
        />

        <SuggestionCarousel
          title="Based on genres you've read"
          books={genreSuggestions}
          isLoading={isLoading}
          placeholder="Mark books as read to get genre-based recommendations!"
          hasData={hasReadBooks}
          icon={BookOpen}
          onRefresh={refetch}
        />

        <SuggestionCarousel
          title="Similar to your 5-star books"
          books={ratingSuggestions}
          isLoading={isLoading}
          placeholder="Rate some books 5 stars to get similar recommendations!"
          hasData={hasFiveStarBooks}
          icon={Star}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
