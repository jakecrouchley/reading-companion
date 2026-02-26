'use client';

import { useQuery } from '@tanstack/react-query';
import { getOpenLibraryRatings, type OpenLibraryRatings } from '@/services/api/openLibrary';

export function useOpenLibraryRatings(isbn: string | undefined) {
  return useQuery<OpenLibraryRatings | null>({
    queryKey: ['openLibraryRatings', isbn],
    queryFn: () => getOpenLibraryRatings(isbn!),
    enabled: !!isbn,
    staleTime: 30 * 60 * 1000, // 30 minutes - ratings don't change often
    retry: false, // Don't retry if book not found in Open Library
  });
}
