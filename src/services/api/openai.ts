import OpenAI from 'openai';
import type { SavedBook, AIRecommendation } from '@/types';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true,
});

interface RecommendationResponse {
  byAuthors: AIRecommendation[];
  byGenres: AIRecommendation[];
  byRatings: AIRecommendation[];
  bySomethingNew: AIRecommendation[];
}

function buildRecommendationPrompt(savedBooks: SavedBook[]): string {
  const savedList = savedBooks
    .map((sb) => `- "${sb.book.title}" by ${sb.book.authors?.join(', ') || 'Unknown'} (${sb.book.categories?.join(', ') || 'Unknown'})`)
    .join('\n');

  const readBooks = savedBooks.filter((sb) => sb.status === 'read');
  const readList = readBooks
    .map((sb) => `- "${sb.book.title}" by ${sb.book.authors?.join(', ') || 'Unknown'} - ${sb.userRating || 'unrated'} stars`)
    .join('\n');

  const fiveStarBooks = savedBooks.filter((sb) => sb.userRating === 5);
  const fiveStarList = fiveStarBooks
    .map((sb) => `- "${sb.book.title}" by ${sb.book.authors?.join(', ') || 'Unknown'}`)
    .join('\n');

  // Extract unique authors and genres for "Something New" category
  const knownAuthors = [...new Set(savedBooks.flatMap((sb) => sb.book.authors || []))];
  const knownGenres = [...new Set(savedBooks.flatMap((sb) => sb.book.categories || []))];

  return `Suggest 3 books per category based on this reading history. Be concise.

SAVED: ${savedList || 'None'}
READ: ${readList || 'None'}
5-STAR: ${fiveStarList || 'None'}

KNOWN AUTHORS (for reference): ${knownAuthors.join(', ') || 'None'}
KNOWN GENRES (for reference): ${knownGenres.join(', ') || 'None'}

Categories:
- byAuthors: More books by authors from the saved list
- byGenres: Books in similar genres to what they've read
- byRatings: Books similar to their 5-star rated books
- bySomethingNew: Books by AUTHORS NOT in the known authors list, but in genres SIMILAR to their known genres. Help them discover new voices in familiar territory.

Return JSON: {"byAuthors":[{"title":"...","author":"...","genre":"...","reason":"..."}],"byGenres":[...],"byRatings":[...],"bySomethingNew":[...]}`;
}

export type RecommendationCategory = 'byAuthors' | 'byGenres' | 'byRatings' | 'bySomethingNew';

const categoryDescriptions: Record<RecommendationCategory, string> = {
  byAuthors: 'More books by authors from the saved list',
  byGenres: 'Books in similar genres to what they\'ve read',
  byRatings: 'Books similar to their 5-star rated books',
  bySomethingNew: 'Books by AUTHORS NOT in the known authors list, but in genres SIMILAR to their known genres. Help them discover new voices in familiar territory.',
};

function buildSingleCategoryPrompt(
  savedBooks: SavedBook[],
  category: RecommendationCategory,
  excludeTitles: string[] = []
): string {
  const savedList = savedBooks
    .map((sb) => `- "${sb.book.title}" by ${sb.book.authors?.join(', ') || 'Unknown'} (${sb.book.categories?.join(', ') || 'Unknown'})`)
    .join('\n');

  const readBooks = savedBooks.filter((sb) => sb.status === 'read');
  const readList = readBooks
    .map((sb) => `- "${sb.book.title}" by ${sb.book.authors?.join(', ') || 'Unknown'} - ${sb.userRating || 'unrated'} stars`)
    .join('\n');

  const fiveStarBooks = savedBooks.filter((sb) => sb.userRating === 5);
  const fiveStarList = fiveStarBooks
    .map((sb) => `- "${sb.book.title}" by ${sb.book.authors?.join(', ') || 'Unknown'}`)
    .join('\n');

  const knownAuthors = [...new Set(savedBooks.flatMap((sb) => sb.book.authors || []))];
  const knownGenres = [...new Set(savedBooks.flatMap((sb) => sb.book.categories || []))];

  const excludeSection = excludeTitles.length > 0
    ? `\nDO NOT SUGGEST THESE (already recommended): ${excludeTitles.join(', ')}\n`
    : '';

  return `Suggest 3 NEW and DIFFERENT books based on this reading history. Be creative and suggest books you haven't suggested before.

SAVED: ${savedList || 'None'}
READ: ${readList || 'None'}
5-STAR: ${fiveStarList || 'None'}

KNOWN AUTHORS: ${knownAuthors.join(', ') || 'None'}
KNOWN GENRES: ${knownGenres.join(', ') || 'None'}
${excludeSection}
Category: ${categoryDescriptions[category]}

Return JSON: {"recommendations":[{"title":"...","author":"...","genre":"...","reason":"..."}]}`;
}

export async function getSingleCategoryRecommendations(
  savedBooks: SavedBook[],
  category: RecommendationCategory,
  excludeTitles: string[] = []
): Promise<AIRecommendation[]> {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || savedBooks.length === 0) {
    return [];
  }

  try {
    const prompt = buildSingleCategoryPrompt(savedBooks, category, excludeTitles);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a book recommendation expert. Suggest fresh, diverse recommendations. Always return valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return [];

    const parsed = JSON.parse(content) as { recommendations: AIRecommendation[] };
    return parsed.recommendations || [];
  } catch (error) {
    console.error('OpenAI API error:', error);
    return [];
  }
}

export async function getAIRecommendations(
  savedBooks: SavedBook[]
): Promise<RecommendationResponse> {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured');
    return { byAuthors: [], byGenres: [], byRatings: [], bySomethingNew: [] };
  }

  if (savedBooks.length === 0) {
    return { byAuthors: [], byGenres: [], byRatings: [], bySomethingNew: [] };
  }

  try {
    const prompt = buildRecommendationPrompt(savedBooks);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a book recommendation expert. Provide thoughtful, personalized book recommendations based on reading history. Always return valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_completion_tokens: 4000,
    });

    const message = response.choices[0]?.message;
    const content = message?.content;

    if (!content) {
      throw new Error(`No content in response. Finish reason: ${response.choices[0]?.finish_reason}`);
    }

    const parsed = JSON.parse(content) as RecommendationResponse;
    return {
      byAuthors: parsed.byAuthors || [],
      byGenres: parsed.byGenres || [],
      byRatings: parsed.byRatings || [],
      bySomethingNew: parsed.bySomethingNew || [],
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return { byAuthors: [], byGenres: [], byRatings: [], bySomethingNew: [] };
  }
}
