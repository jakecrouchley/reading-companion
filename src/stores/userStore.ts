import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { UserPreferences, SortOption, SortDirection, ReadingStatus } from '@/types';

interface UserState extends UserPreferences {
  completeOnboarding: () => void;
  setSortPreference: (sort: SortOption) => void;
  setSortDirection: (direction: SortDirection) => void;
  setFilterPreference: (filter: ReadingStatus | 'all') => void;
  setLastSearchQuery: (query: string | null) => void;
  addRecentSearch: (query: string) => void;
  reset: () => void;
}

const initialState: UserPreferences = {
  hasCompletedOnboarding: false,
  sortPreference: 'date_saved',
  sortDirection: 'desc',
  filterPreference: 'all',
  lastSearchQuery: null,
  recentSearches: [],
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      ...initialState,

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      setSortPreference: (sortPreference) => {
        set({ sortPreference });
      },

      setSortDirection: (sortDirection) => {
        set({ sortDirection });
      },

      setFilterPreference: (filterPreference) => {
        set({ filterPreference });
      },

      setLastSearchQuery: (lastSearchQuery) => {
        set({ lastSearchQuery });
      },

      addRecentSearch: (query) => {
        set((state) => {
          // Remove duplicate if exists, add to front, keep max 3
          const filtered = state.recentSearches.filter(
            (s) => s.toLowerCase() !== query.toLowerCase()
          );
          return { recentSearches: [query, ...filtered].slice(0, 3) };
        });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
