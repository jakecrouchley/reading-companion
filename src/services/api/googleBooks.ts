import axios from 'axios';
import type { Book } from '@/types';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

interface GoogleBookVolume {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    categories?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    averageRating?: number;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

function transformGoogleBook(volume: GoogleBookVolume): Book {
  const { volumeInfo } = volume;
  const isbn = volumeInfo.industryIdentifiers?.find(
    (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
  )?.identifier;

  return {
    id: volume.id,
    source: 'google',
    title: volumeInfo.title,
    authors: volumeInfo.authors,
    categories: volumeInfo.categories,
    description: volumeInfo.description,
    thumbnail: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
    averageRating: volumeInfo.averageRating,
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    isbn,
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  try {
    // Search both title and author in parallel for better results
    const [titleResults, authorResults] = await Promise.all([
      axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: `intitle:${query}`,
          key: API_KEY,
          maxResults: 15,
        },
      }),
      axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: `inauthor:${query}`,
          key: API_KEY,
          maxResults: 15,
        },
      }),
    ]);

    const titleBooks: Book[] = (titleResults.data.items || []).map(transformGoogleBook);
    const authorBooks: Book[] = (authorResults.data.items || []).map(transformGoogleBook);

    // Merge results, prioritizing author matches when query looks like an author name
    // (single word or 2-3 words without common title words)
    const queryWords = query.trim().split(/\s+/);
    const isLikelyAuthorSearch = queryWords.length <= 3 &&
      !query.toLowerCase().match(/\b(the|a|an|of|and|in|on|at|to|for)\b/);

    const seen = new Set<string>();
    const merged: Book[] = [];

    // Add books in order of priority
    const primaryResults = isLikelyAuthorSearch ? authorBooks : titleBooks;
    const secondaryResults = isLikelyAuthorSearch ? titleBooks : authorBooks;

    for (const book of primaryResults) {
      if (!seen.has(book.id)) {
        seen.add(book.id);
        merged.push(book);
      }
    }

    for (const book of secondaryResults) {
      if (!seen.has(book.id)) {
        seen.add(book.id);
        merged.push(book);
      }
    }

    return merged.slice(0, 20);
  } catch (error) {
    console.error('Google Books API error:', error);
    return [];
  }
}

export async function getBookByTitle(title: string, author?: string): Promise<Book | null> {
  try {
    const query = author ? `intitle:${title}+inauthor:${author}` : `intitle:${title}`;
    const response = await axios.get(GOOGLE_BOOKS_API, {
      params: {
        q: query,
        key: API_KEY,
        maxResults: 1,
      },
    });

    if (!response.data.items?.[0]) return null;

    return transformGoogleBook(response.data.items[0]);
  } catch (error) {
    console.error('Google Books API error:', error);
    return null;
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  try {
    const response = await axios.get(`${GOOGLE_BOOKS_API}/${id}`, {
      params: { key: API_KEY },
    });

    return transformGoogleBook(response.data);
  } catch (error) {
    console.error('Google Books API error:', error);
    return null;
  }
}
