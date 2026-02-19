'use client';

import { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useSavedBooksStore } from '@/stores';
import { getAIRecommendations, getSingleCategoryRecommendations } from '@/services/api/openai';
import { fetchBookDetails } from '@/services/suggestions/suggestionEngine';
import type { Book, AIRecommendation } from '@/types';

interface CategoryResult {
  books: Book[];
  isLoading: boolean;
  isLoadingMore: boolean;
  refetch: () => void;
}

interface UseSuggestionsResult {
  authorSuggestions: CategoryResult;
  genreSuggestions: CategoryResult;
  ratingSuggestions: CategoryResult;
  somethingNewSuggestions: CategoryResult;
  isLoadingAny: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSuggestions(): UseSuggestionsResult {
  const queryClient = useQueryClient();
  const savedBooks = useSavedBooksStore((s) => s.savedBooks);

  // Track refresh counters for each category to force new API calls
  const [refreshCounters, setRefreshCounters] = useState({
    authors: 0,
    genres: 0,
    ratings: 0,
    somethingNew: 0,
  });

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

  const savedBookTitles = useMemo(
    () => new Set(savedBooks.map((sb) => sb.book.title.toLowerCase())),
    [savedBooks]
  );

  const filterSaved = useCallback(
    (recs: AIRecommendation[]) =>
      recs.filter((rec) => !savedBookTitles.has(rec.title.toLowerCase())),
    [savedBookTitles]
  );

  // Initial bulk query for all categories
  const {
    data: aiRecommendations,
    isFetching: isFetchingAI,
    error: aiError,
  } = useQuery({
    queryKey: ['ai-recommendations', savedBooks.length, readBooks.length, fiveStarBooks.length],
    queryFn: () => getAIRecommendations(savedBooks),
    enabled: hasSavedBooks || hasReadBooks || hasFiveStarBooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Individual category queries - can be refreshed independently (initial 3 books)
  // These fetch directly without waiting for bulk query - simpler and more reliable
  const authorQuery = useQuery({
    queryKey: ['suggestions-authors', refreshCounters.authors, savedBooks.length],
    queryFn: async () => {
      // Use bulk data if available, otherwise fetch directly
      if (aiRecommendations?.byAuthors?.length) {
        return fetchBookDetails(filterSaved(aiRecommendations.byAuthors).slice(0, 3));
      }
      const recs = await getSingleCategoryRecommendations(savedBooks, 'byAuthors');
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasSavedBooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const genreQuery = useQuery({
    queryKey: ['suggestions-genres', refreshCounters.genres, readBooks.length],
    queryFn: async () => {
      if (aiRecommendations?.byGenres?.length) {
        return fetchBookDetails(filterSaved(aiRecommendations.byGenres).slice(0, 3));
      }
      const recs = await getSingleCategoryRecommendations(savedBooks, 'byGenres');
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasReadBooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const ratingQuery = useQuery({
    queryKey: ['suggestions-ratings', refreshCounters.ratings, fiveStarBooks.length],
    queryFn: async () => {
      if (aiRecommendations?.byRatings?.length) {
        return fetchBookDetails(filterSaved(aiRecommendations.byRatings).slice(0, 3));
      }
      const recs = await getSingleCategoryRecommendations(savedBooks, 'byRatings');
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasFiveStarBooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const somethingNewQuery = useQuery({
    queryKey: ['suggestions-something-new', refreshCounters.somethingNew, savedBooks.length],
    queryFn: async () => {
      if (aiRecommendations?.bySomethingNew?.length) {
        return fetchBookDetails(filterSaved(aiRecommendations.bySomethingNew).slice(0, 3));
      }
      const recs = await getSingleCategoryRecommendations(savedBooks, 'bySomethingNew');
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasSavedBooks,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Secondary queries to load 3 more books per category after initial load
  const authorMoreQuery = useQuery({
    queryKey: ['suggestions-authors-more', refreshCounters.authors, savedBooks.length],
    queryFn: async () => {
      // Pass existing titles to exclude from API recommendations
      const existingTitles = (authorQuery.data || []).map(b => b.title);
      const recs = await getSingleCategoryRecommendations(savedBooks, 'byAuthors', existingTitles);
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasSavedBooks && !!authorQuery.data?.length && !authorQuery.isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const genreMoreQuery = useQuery({
    queryKey: ['suggestions-genres-more', refreshCounters.genres, readBooks.length],
    queryFn: async () => {
      const existingTitles = (genreQuery.data || []).map(b => b.title);
      const recs = await getSingleCategoryRecommendations(savedBooks, 'byGenres', existingTitles);
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasReadBooks && !!genreQuery.data?.length && !genreQuery.isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const ratingMoreQuery = useQuery({
    queryKey: ['suggestions-ratings-more', refreshCounters.ratings, fiveStarBooks.length],
    queryFn: async () => {
      const existingTitles = (ratingQuery.data || []).map(b => b.title);
      const recs = await getSingleCategoryRecommendations(savedBooks, 'byRatings', existingTitles);
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasFiveStarBooks && !!ratingQuery.data?.length && !ratingQuery.isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  const somethingNewMoreQuery = useQuery({
    queryKey: ['suggestions-something-new-more', refreshCounters.somethingNew, savedBooks.length],
    queryFn: async () => {
      const existingTitles = (somethingNewQuery.data || []).map(b => b.title);
      const recs = await getSingleCategoryRecommendations(savedBooks, 'bySomethingNew', existingTitles);
      return fetchBookDetails(filterSaved(recs).slice(0, 3));
    },
    enabled: hasSavedBooks && !!somethingNewQuery.data?.length && !somethingNewQuery.isFetching,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
  });

  // Individual category refresh - increments counter to trigger new API call
  const refetchAuthors = useCallback(() => {
    setRefreshCounters((prev) => ({ ...prev, authors: prev.authors + 1 }));
  }, []);

  const refetchGenres = useCallback(() => {
    setRefreshCounters((prev) => ({ ...prev, genres: prev.genres + 1 }));
  }, []);

  const refetchRatings = useCallback(() => {
    setRefreshCounters((prev) => ({ ...prev, ratings: prev.ratings + 1 }));
  }, []);

  const refetchSomethingNew = useCallback(() => {
    setRefreshCounters((prev) => ({ ...prev, somethingNew: prev.somethingNew + 1 }));
  }, []);

  // Refresh all categories
  const refetchAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    setRefreshCounters({ authors: 0, genres: 0, ratings: 0, somethingNew: 0 });
  }, [queryClient]);

  // Combine initial and more books for each category
  const authorBooksRaw = useMemo(() => {
    const initial = authorQuery.data || [];
    const more = authorMoreQuery.data || [];
    return [...initial, ...more];
  }, [authorQuery.data, authorMoreQuery.data]);

  const genreBooksRaw = useMemo(() => {
    const initial = genreQuery.data || [];
    const more = genreMoreQuery.data || [];
    return [...initial, ...more];
  }, [genreQuery.data, genreMoreQuery.data]);

  const ratingBooksRaw = useMemo(() => {
    const initial = ratingQuery.data || [];
    const more = ratingMoreQuery.data || [];
    return [...initial, ...more];
  }, [ratingQuery.data, ratingMoreQuery.data]);

  const somethingNewBooksRaw = useMemo(() => {
    const initial = somethingNewQuery.data || [];
    const more = somethingNewMoreQuery.data || [];
    return [...initial, ...more];
  }, [somethingNewQuery.data, somethingNewMoreQuery.data]);

  // Cache last successful data in state - prevents empty flashes during transitions
  const [cachedAuthorBooks, setCachedAuthorBooks] = useState<Book[]>([]);
  const [cachedGenreBooks, setCachedGenreBooks] = useState<Book[]>([]);
  const [cachedRatingBooks, setCachedRatingBooks] = useState<Book[]>([]);
  const [cachedSomethingNewBooks, setCachedSomethingNewBooks] = useState<Book[]>([]);

  useEffect(() => {
    if (authorBooksRaw.length > 0) setCachedAuthorBooks(authorBooksRaw);
  }, [authorBooksRaw]);

  useEffect(() => {
    if (genreBooksRaw.length > 0) setCachedGenreBooks(genreBooksRaw);
  }, [genreBooksRaw]);

  useEffect(() => {
    if (ratingBooksRaw.length > 0) setCachedRatingBooks(ratingBooksRaw);
  }, [ratingBooksRaw]);

  useEffect(() => {
    if (somethingNewBooksRaw.length > 0) setCachedSomethingNewBooks(somethingNewBooksRaw);
  }, [somethingNewBooksRaw]);

  // Use raw data if available, otherwise fall back to cached
  const authorBooks = authorBooksRaw.length > 0 ? authorBooksRaw : cachedAuthorBooks;
  const genreBooks = genreBooksRaw.length > 0 ? genreBooksRaw : cachedGenreBooks;
  const ratingBooks = ratingBooksRaw.length > 0 ? ratingBooksRaw : cachedRatingBooks;
  const somethingNewBooks = somethingNewBooksRaw.length > 0 ? somethingNewBooksRaw : cachedSomethingNewBooks;

  return {
    authorSuggestions: {
      books: hasSavedBooks ? authorBooks : [],
      isLoading: hasSavedBooks && (authorQuery.isFetching || authorQuery.isPending),
      isLoadingMore: hasSavedBooks && authorMoreQuery.isFetching,
      refetch: refetchAuthors,
    },
    genreSuggestions: {
      books: hasReadBooks ? genreBooks : [],
      isLoading: hasReadBooks && (genreQuery.isFetching || genreQuery.isPending),
      isLoadingMore: hasReadBooks && genreMoreQuery.isFetching,
      refetch: refetchGenres,
    },
    ratingSuggestions: {
      books: hasFiveStarBooks ? ratingBooks : [],
      isLoading: hasFiveStarBooks && (ratingQuery.isFetching || ratingQuery.isPending),
      isLoadingMore: hasFiveStarBooks && ratingMoreQuery.isFetching,
      refetch: refetchRatings,
    },
    somethingNewSuggestions: {
      books: hasSavedBooks ? somethingNewBooks : [],
      isLoading: hasSavedBooks && (somethingNewQuery.isFetching || somethingNewQuery.isPending),
      isLoadingMore: hasSavedBooks && somethingNewMoreQuery.isFetching,
      refetch: refetchSomethingNew,
    },
    isLoadingAny: isFetchingAI || authorQuery.isFetching || genreQuery.isFetching || ratingQuery.isFetching || somethingNewQuery.isFetching,
    error: aiError as Error | null,
    refetch: refetchAll,
  };
}
