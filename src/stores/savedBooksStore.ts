import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from './storage';
import type { Book, SavedBook, ReadingStatus } from '@/types';

interface SavedBooksState {
  savedBooks: SavedBook[];
  saveBook: (book: Book, notes?: string) => void;
  updateBook: (id: string, updates: Partial<Omit<SavedBook, 'id' | 'bookId' | 'book'>>) => void;
  deleteBook: (id: string) => void;
  getBookById: (id: string) => SavedBook | undefined;
  isBookSaved: (bookId: string) => boolean;
  getSavedBookIds: () => string[];
  getBooksByStatus: (status: ReadingStatus) => SavedBook[];
  getCompletedBooks: () => SavedBook[];
  getFiveStarBooks: () => SavedBook[];
}

export const useSavedBooksStore = create<SavedBooksState>()(
  persist(
    (set, get) => ({
      savedBooks: [],

      saveBook: (book, notes) => {
        // Prevent duplicates at the store level
        if (get().savedBooks.some((sb) => sb.bookId === book.id)) {
          return;
        }

        const now = new Date();
        const savedBook: SavedBook = {
          id: crypto.randomUUID(),
          bookId: book.id,
          book,
          status: 'not_started',
          notes,
          savedAt: now,
          updatedAt: now,
        };

        set((state) => ({
          savedBooks: [savedBook, ...state.savedBooks],
        }));
      },

      updateBook: (id, updates) => {
        set((state) => ({
          savedBooks: state.savedBooks.map((book) => {
            if (book.id !== id) return book;

            const updatedBook = { ...book, ...updates, updatedAt: new Date() };

            // Set startedAt when status changes to 'reading'
            if (updates.status === 'reading' && !book.startedAt) {
              updatedBook.startedAt = new Date();
            }

            // Set completedAt when status changes to 'completed'
            if (updates.status === 'completed' && !book.completedAt) {
              updatedBook.completedAt = new Date();
            }

            return updatedBook;
          }),
        }));
      },

      deleteBook: (id) => {
        set((state) => ({
          savedBooks: state.savedBooks.filter((book) => book.id !== id),
        }));
      },

      getBookById: (id) => {
        return get().savedBooks.find((book) => book.id === id);
      },

      isBookSaved: (bookId) => {
        return get().savedBooks.some((book) => book.bookId === bookId);
      },

      getSavedBookIds: () => {
        return get().savedBooks.map((book) => book.bookId);
      },

      getBooksByStatus: (status) => {
        return get().savedBooks.filter((book) => book.status === status);
      },

      getCompletedBooks: () => {
        return get().savedBooks.filter((book) => book.status === 'completed');
      },

      getFiveStarBooks: () => {
        return get().savedBooks.filter((book) => book.userRating === 5);
      },
    }),
    {
      name: 'saved-books',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ savedBooks: state.savedBooks }),
    }
  )
);
