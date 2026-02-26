export interface Book {
  id: string;
  source: 'google';
  title: string;
  authors?: string[];
  categories?: string[];
  description?: string;
  thumbnail?: string;
  publishedDate?: string;
  pageCount?: number;
  isbn?: string;
  language?: string;
}

export type ReadingStatus = 'not_started' | 'reading' | 'read' | 'quit';

export interface SavedBook {
  id: string;
  bookId: string;
  book: Book;
  status: ReadingStatus;
  notes?: string;
  savedAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  readAt?: Date;
  userRating?: number;
}

export interface AIRecommendation {
  title: string;
  author: string;
  genre: string;
  reason: string;
}
