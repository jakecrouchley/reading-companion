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
    language?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
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

// Calculate how well a book title matches the search query
function getTitleMatchScore(title: string, query: string): number {
  const normalizedTitle = title.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  // Exact match (ignoring "the" prefix)
  const titleWithoutThe = normalizedTitle.replace(/^the\s+/, '');
  const queryWithoutThe = normalizedQuery.replace(/^the\s+/, '');
  if (titleWithoutThe === queryWithoutThe || normalizedTitle === normalizedQuery) {
    return 100;
  }

  // Title starts with the query
  if (normalizedTitle.startsWith(normalizedQuery) || titleWithoutThe.startsWith(queryWithoutThe)) {
    return 80;
  }

  // Query words appear in order in the title
  const queryWords = normalizedQuery.split(/\s+/);
  const titleWords = normalizedTitle.split(/\s+/);

  // Check if all query words appear in order
  let titleIndex = 0;
  let matchedInOrder = true;
  for (const queryWord of queryWords) {
    let found = false;
    while (titleIndex < titleWords.length) {
      if (titleWords[titleIndex].includes(queryWord) || queryWord.includes(titleWords[titleIndex])) {
        found = true;
        titleIndex++;
        break;
      }
      titleIndex++;
    }
    if (!found) {
      matchedInOrder = false;
      break;
    }
  }
  if (matchedInOrder && queryWords.length > 1) {
    return 60;
  }

  // All query words appear somewhere in title
  const allWordsPresent = queryWords.every(word =>
    titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
  );
  if (allWordsPresent) {
    return 40;
  }

  // Some query words appear in title
  const matchingWords = queryWords.filter(word =>
    titleWords.some(titleWord => titleWord.includes(word) || word.includes(titleWord))
  );
  if (matchingWords.length > 0) {
    return 20 * (matchingWords.length / queryWords.length);
  }

  return 0;
}

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
    publishedDate: volumeInfo.publishedDate,
    pageCount: volumeInfo.pageCount,
    isbn,
    language: volumeInfo.language,
  };
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) return [];

  try {
    const isGenreSearch = isLikelyGenreSearch(query);

    // Build search requests based on query type
    const searchPromises = [
      // General relevance search - uses Google's built-in relevance scoring
      axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: query,
          key: API_KEY,
          maxResults: 20,
          orderBy: 'relevance',
        },
      }),
      // Title-specific search
      axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: `intitle:${query}`,
          key: API_KEY,
          maxResults: 15,
        },
      }),
      // Author-specific search
      axios.get(GOOGLE_BOOKS_API, {
        params: {
          q: `inauthor:${query}`,
          key: API_KEY,
          maxResults: 10,
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

    const relevanceBooks = getBooks(results[0]);
    const titleBooks = getBooks(results[1]);
    const authorBooks = getBooks(results[2]);
    const genreBooks = isGenreSearch ? getBooks(results[3]) : [];

    // Collect all unique books
    const seen = new Set<string>();
    const merged: Book[] = [];

    // Determine search type priority
    const queryWords = query.trim().split(/\s+/);
    const isLikelyAuthorSearch = !isGenreSearch && queryWords.length <= 3 &&
      !query.toLowerCase().match(/\b(the|a|an|of|and|in|on|at|to|for)\b/);

    // Determine priority order based on search type
    let orderedResults: Book[][];
    if (isGenreSearch) {
      // For genre searches, prioritize subject results
      orderedResults = [genreBooks, relevanceBooks, titleBooks, authorBooks];
    } else if (isLikelyAuthorSearch) {
      orderedResults = [authorBooks, relevanceBooks, titleBooks];
    } else {
      // For title/general searches, prioritize relevance and title matches
      orderedResults = [relevanceBooks, titleBooks, authorBooks];
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

    // Sort by title match score, then language, then thumbnail presence
    merged.sort((a, b) => {
      const aTitleScore = getTitleMatchScore(a.title, query);
      const bTitleScore = getTitleMatchScore(b.title, query);

      // Strong title match difference takes priority
      if (Math.abs(aTitleScore - bTitleScore) >= 20) {
        return bTitleScore - aTitleScore;
      }

      // Then consider language and thumbnail
      const aIsEnglish = a.language === 'en' ? 4 : 0;
      const bIsEnglish = b.language === 'en' ? 4 : 0;
      const aScore = aTitleScore + aIsEnglish + (a.thumbnail ? 2 : 0);
      const bScore = bTitleScore + bIsEnglish + (b.thumbnail ? 2 : 0);
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
