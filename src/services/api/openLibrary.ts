import axios from 'axios';

const OPEN_LIBRARY_API = 'https://openlibrary.org';

export interface OpenLibraryRatings {
  average: number;
  count: number;
}

interface OpenLibraryEdition {
  works?: Array<{ key: string }>;
}

interface OpenLibraryRatingsResponse {
  summary: {
    average: number;
    count: number;
    sortable: number;
  };
  counts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

// Cache to avoid repeated API calls for the same ISBN
const ratingsCache = new Map<string, OpenLibraryRatings | null>();

export async function getOpenLibraryRatings(isbn: string): Promise<OpenLibraryRatings | null> {
  if (!isbn) return null;

  // Check cache first
  if (ratingsCache.has(isbn)) {
    return ratingsCache.get(isbn) ?? null;
  }

  try {
    // Step 1: Look up the edition by ISBN to get the work ID
    const editionResponse = await axios.get<OpenLibraryEdition>(
      `${OPEN_LIBRARY_API}/isbn/${isbn}.json`,
      { timeout: 5000 }
    );

    const workKey = editionResponse.data.works?.[0]?.key;
    if (!workKey) {
      ratingsCache.set(isbn, null);
      return null;
    }

    // Step 2: Fetch ratings using the work ID
    const ratingsResponse = await axios.get<OpenLibraryRatingsResponse>(
      `${OPEN_LIBRARY_API}${workKey}/ratings.json`,
      { timeout: 5000 }
    );

    const { summary } = ratingsResponse.data;

    if (!summary || summary.count === 0) {
      ratingsCache.set(isbn, null);
      return null;
    }

    const ratings: OpenLibraryRatings = {
      average: summary.average,
      count: summary.count,
    };

    ratingsCache.set(isbn, ratings);
    return ratings;
  } catch (error) {
    // Silently fail - Open Library may not have the book
    ratingsCache.set(isbn, null);
    return null;
  }
}

// Batch fetch ratings for multiple ISBNs
export async function getOpenLibraryRatingsBatch(
  isbns: string[]
): Promise<Map<string, OpenLibraryRatings | null>> {
  const results = new Map<string, OpenLibraryRatings | null>();

  // Filter out empty ISBNs and already cached ones
  const toFetch = isbns.filter((isbn) => isbn && !ratingsCache.has(isbn));

  // Fetch in parallel with a concurrency limit to be nice to Open Library
  const BATCH_SIZE = 5;
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const batch = toFetch.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((isbn) => getOpenLibraryRatings(isbn)));
  }

  // Return all results from cache
  for (const isbn of isbns) {
    if (isbn) {
      results.set(isbn, ratingsCache.get(isbn) ?? null);
    }
  }

  return results;
}
