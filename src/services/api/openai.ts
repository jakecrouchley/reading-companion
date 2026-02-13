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

  return `Suggest 3 books per category based on this reading history. Be concise.

SAVED: ${savedList || 'None'}
READ: ${readList || 'None'}
5-STAR: ${fiveStarList || 'None'}

Return JSON: {"byAuthors":[{"title":"...","author":"...","genre":"...","reason":"..."}],"byGenres":[...],"byRatings":[...]}`;
}

export async function getAIRecommendations(
  savedBooks: SavedBook[]
): Promise<RecommendationResponse> {
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured');
    return { byAuthors: [], byGenres: [], byRatings: [] };
  }

  if (savedBooks.length === 0) {
    return { byAuthors: [], byGenres: [], byRatings: [] };
  }

  try {
    const prompt = buildRecommendationPrompt(savedBooks);

    const response = await openai.chat.completions.create({
      model: 'gpt-5-mini',
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
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return { byAuthors: [], byGenres: [], byRatings: [] };
  }
}
