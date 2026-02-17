'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar, SuggestionCarousel } from '@/components/discover';
import { useSavedBooksStore, useUserStore } from '@/stores';
import { useSuggestions } from '@/hooks';
import { PenTool, BookOpen, Star, Compass, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DiscoverPage() {
  const router = useRouter();
  const lastSearchQuery = useUserStore((s) => s.lastSearchQuery);
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
    somethingNewSuggestions,
  } = useSuggestions();

  // Redirect to search results if there's a stored search query
  useEffect(() => {
    if (lastSearchQuery) {
      router.replace(`/search/${encodeURIComponent(lastSearchQuery)}`);
    }
  }, [lastSearchQuery, router]);

  // Don't render while redirecting to search (must be after all hooks)
  if (lastSearchQuery) {
    return null;
  }

  const hasSavedBooks = savedBooks.length > 0;
  const hasReadBooks = readBooks.length > 0;
  const hasFiveStarBooks = fiveStarBooks.length > 0;

  return (
    <div className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div className="w-10" />
        <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
        <Link
          href="/settings"
          className="p-2 -mr-2 min-w-[40px] min-h-[40px] flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
        >
          <Settings size={24} className="text-gray-600" />
        </Link>
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
          books={authorSuggestions.books}
          isLoading={authorSuggestions.isLoading}
          isLoadingMore={authorSuggestions.isLoadingMore}
          placeholder="Save some books so I can learn what to recommend!"
          hasData={hasSavedBooks}
          icon={PenTool}
          onRefresh={authorSuggestions.refetch}
        />

        <SuggestionCarousel
          title="Based on genres you've read"
          books={genreSuggestions.books}
          isLoading={genreSuggestions.isLoading}
          isLoadingMore={genreSuggestions.isLoadingMore}
          placeholder="Mark books as read to get genre-based recommendations!"
          hasData={hasReadBooks}
          icon={BookOpen}
          onRefresh={genreSuggestions.refetch}
        />

        <SuggestionCarousel
          title="Similar to your 5-star books"
          books={ratingSuggestions.books}
          isLoading={ratingSuggestions.isLoading}
          isLoadingMore={ratingSuggestions.isLoadingMore}
          placeholder="Rate some books 5 stars to get similar recommendations!"
          hasData={hasFiveStarBooks}
          icon={Star}
          onRefresh={ratingSuggestions.refetch}
        />

        <SuggestionCarousel
          title="Something new to try"
          books={somethingNewSuggestions.books}
          isLoading={somethingNewSuggestions.isLoading}
          isLoadingMore={somethingNewSuggestions.isLoadingMore}
          placeholder="Save some books to discover new authors in your favorite genres!"
          hasData={hasSavedBooks}
          icon={Compass}
          onRefresh={somethingNewSuggestions.refetch}
        />
      </div>
    </div>
  );
}
