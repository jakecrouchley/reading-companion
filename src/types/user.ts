import type { ReadingStatus } from './book';

export type SortOption = 'date_saved' | 'rating';
export type SortDirection = 'asc' | 'desc';

export interface UserPreferences {
  hasCompletedOnboarding: boolean;
  sortPreference: SortOption;
  sortDirection: SortDirection;
  filterPreference: ReadingStatus | 'all';
  lastSearchQuery: string | null;
  recentSearches: string[];
}
