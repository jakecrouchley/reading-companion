import type { SavedBook, Book, AIRecommendation } from '@/types';
import { getAIRecommendations } from '@/services/api/openai';
import { getBookByTitle } from '@/services/api/googleBooks';

interface Suggestions {
  byAuthors: Book[];
  byGenres: Book[];
  byRatings: Book[];
  bySomethingNew: Book[];
}

export async function fetchBookDetails(recommendations: AIRecommendation[]): Promise<Book[]> {
  const bookPromises = recommendations.map(async (rec) => {
    try {
      const book = await getBookByTitle(rec.title, rec.author);
      if (book) {
        return book;
      }
      // If not found, create a placeholder book from the recommendation
      return {
        id: `ai-${rec.title.toLowerCase().replace(/\s+/g, '-')}`,
        source: 'google' as const,
        title: rec.title,
        authors: [rec.author],
        categories: [rec.genre],
        description: rec.reason,
      };
    } catch (error) {
      console.error(`Failed to fetch book details for "${rec.title}":`, error);
      return null;
    }
  });

  const books = await Promise.all(bookPromises);
  return books.filter((book): book is Book => book !== null);
}

export async function generateSuggestions(savedBooks: SavedBook[]): Promise<Suggestions> {
  // Get AI recommendations
  const aiRecommendations = await getAIRecommendations(savedBooks);

  // Filter out books that are already saved
  const savedBookTitles = new Set(savedBooks.map((sb) => sb.book.title.toLowerCase()));

  const filterSaved = (recs: AIRecommendation[]) =>
    recs.filter((rec) => !savedBookTitles.has(rec.title.toLowerCase()));

  // Fetch book details from Google Books API
  const [byAuthors, byGenres, byRatings, bySomethingNew] = await Promise.all([
    fetchBookDetails(filterSaved(aiRecommendations.byAuthors).slice(0, 5)),
    fetchBookDetails(filterSaved(aiRecommendations.byGenres).slice(0, 5)),
    fetchBookDetails(filterSaved(aiRecommendations.byRatings).slice(0, 5)),
    fetchBookDetails(filterSaved(aiRecommendations.bySomethingNew).slice(0, 5)),
  ]);

  return {
    byAuthors,
    byGenres,
    byRatings,
    bySomethingNew,
  };
}
