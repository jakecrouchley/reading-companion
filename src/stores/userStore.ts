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
  reset: () => void;
}

const initialState: UserPreferences = {
  hasCompletedOnboarding: false,
  sortPreference: 'date_saved',
  sortDirection: 'desc',
  filterPreference: 'all',
  lastSearchQuery: null,
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
