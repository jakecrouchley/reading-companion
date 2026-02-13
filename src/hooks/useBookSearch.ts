'use client';

import { useQuery } from '@tanstack/react-query';
import { searchBooks } from '@/services/api/googleBooks';

export function useBookSearch(query: string) {
  return useQuery({
    queryKey: ['bookSearch', query],
    queryFn: () => searchBooks(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
