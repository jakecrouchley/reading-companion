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
    ratingsCount?: number;
    publishedDate?: string;
    pageCount?: number;
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

// Common book genres/categories for detection
const COMMON_GENRES = [
  'fiction', 'nonfiction', 'non-fiction',
  'mystery', 'thriller', 'suspense', 'crime',
  'romance', 'love',
  'science fiction', 'sci-fi', 'scifi', 'fantasy', 'dystopian',
  'historical fiction', 'historical',
  'horror', 'gothic',
  'biography', 'memoir', 'autobiography',
  'self-help', 'self help', 'personal development',
  'business', 'economics', 'finance',
  'children', 'kids', 'young adult', 'ya', 'juvenile',
  'cooking', 'cookbook', 'recipes',
  'travel', 'adventure',
  'poetry', 'drama', 'plays',
  'religion', 'spirituality', 'philosophy',
  'science', 'technology', 'computers', 'programming',
  'health', 'fitness', 'wellness',
  'art', 'photography', 'music',
  'history', 'politics', 'true crime',
  'humor', 'comedy', 'satire',
  'graphic novel', 'comics', 'manga',
  'literary fiction', 'classics', 'contemporary',
  'western', 'paranormal', 'supernatural',
];

function isLikelyGenreSearch(query: string): boolean {
  const normalizedQuery = query.toLowerCase().trim();
  return COMMON_GENRES.some(genre =>
    normalizedQuery === genre ||
    normalizedQuery.includes(genre) ||
    genre.includes(normalizedQuery)
  );
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
    ratingsCount: volumeInfo.ratingsCount,
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    isbn,
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  try {
    const isGenreSearch = isLikelyGenreSearch(query);

    // Build search requests based on query type
    const searchPromises = [
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
    ];

    // Add subject search for genre queries
    if (isGenreSearch) {
      searchPromises.push(
        axios.get(GOOGLE_BOOKS_API, {
          params: {
            q: `subject:${query}`,
            key: API_KEY,
            maxResults: 20,
            orderBy: 'relevance',
          },
        })
      );
    }

    // Use allSettled so one failed request doesn't break the entire search
    const results = await Promise.allSettled(searchPromises);

    const getBooks = (result: PromiseSettledResult<unknown>): Book[] => {
      if (result.status === 'fulfilled') {
        const data = result.value as { data: { items?: GoogleBookVolume[] } };
        return (data.data.items || []).map(transformGoogleBook);
      }
      return [];
    };

    const titleBooks = getBooks(results[0]);
    const authorBooks = getBooks(results[1]);
    const genreBooks = isGenreSearch ? getBooks(results[2]) : [];

    // Determine search type priority
    const queryWords = query.trim().split(/\s+/);
    const isLikelyAuthorSearch = !isGenreSearch && queryWords.length <= 3 &&
      !query.toLowerCase().match(/\b(the|a|an|of|and|in|on|at|to|for)\b/);

    const seen = new Set<string>();
    const merged: Book[] = [];

    // Determine priority order based on search type
    let orderedResults: Book[][];
    if (isGenreSearch) {
      // For genre searches, prioritize subject results, then title, then author
      orderedResults = [genreBooks, titleBooks, authorBooks];
    } else if (isLikelyAuthorSearch) {
      orderedResults = [authorBooks, titleBooks];
    } else {
      orderedResults = [titleBooks, authorBooks];
    }

    // Add books in priority order
    for (const resultSet of orderedResults) {
      for (const book of resultSet) {
        if (!seen.has(book.id)) {
          seen.add(book.id);
          merged.push(book);
        }
      }
    }

    // Sort to prioritize books with covers and ratings
    merged.sort((a, b) => {
      const aScore = (a.thumbnail ? 2 : 0) + (a.averageRating ? 1 : 0);
      const bScore = (b.thumbnail ? 2 : 0) + (b.averageRating ? 1 : 0);
      return bScore - aScore;
    });

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
