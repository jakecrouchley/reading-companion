'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSavedBooksStore } from '@/stores';
import { generateSuggestions } from '@/services/suggestions/suggestionEngine';
import type { Book } from '@/types';

interface UseSuggestionsResult {
  authorSuggestions: Book[];
  genreSuggestions: Book[];
  ratingSuggestions: Book[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSuggestions(): UseSuggestionsResult {
  const savedBooks = useSavedBooksStore((s) => s.savedBooks);
  const readBooks = useMemo(
    () => savedBooks.filter((book) => book.status === 'read'),
    [savedBooks]
  );
  const fiveStarBooks = useMemo(
    () => savedBooks.filter((book) => book.userRating === 5),
    [savedBooks]
  );

  const hasSavedBooks = savedBooks.length > 0;
  const hasReadBooks = readBooks.length > 0;
  const hasFiveStarBooks = fiveStarBooks.length > 0;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['suggestions', savedBooks.length, readBooks.length, fiveStarBooks.length],
    queryFn: () => generateSuggestions(savedBooks),
    enabled: hasSavedBooks || hasReadBooks || hasFiveStarBooks,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    authorSuggestions: hasSavedBooks ? (data?.byAuthors || []) : [],
    genreSuggestions: hasReadBooks ? (data?.byGenres || []) : [],
    ratingSuggestions: hasFiveStarBooks ? (data?.byRatings || []) : [],
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
