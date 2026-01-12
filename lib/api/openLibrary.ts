import type { OpenLibrarySearchResponse, OpenLibraryBook, Book } from '../types/book';

const BASE_URL = 'https://openlibrary.org';
const USER_AGENT = 'Bookdart/1.0 (bookdart-app)';

function transformBook(olBook: OpenLibraryBook): Book {
  return {
    id: olBook.key,
    title: olBook.title,
    authors: olBook.author_name || [],
    publishYear: olBook.first_publish_year,
    coverUrl: olBook.cover_i ? getCoverUrl(olBook.cover_i, 'M') : undefined,
    isbn: olBook.isbn,
  };
}

export function getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function searchBooks(query: string): Promise<Book[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=20`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.');
      }
      throw new Error('Unable to search. Please try again.');
    }

    const data: OpenLibrarySearchResponse = await response.json();
    return data.docs.map(transformBook);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to search. Please try again.');
  }
}

export async function searchByTitle(title: string): Promise<Book[]> {
  if (!title.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search.json?title=${encodeURIComponent(title)}&limit=20`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.');
      }
      throw new Error('Unable to search. Please try again.');
    }

    const data: OpenLibrarySearchResponse = await response.json();
    return data.docs.map(transformBook);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to search. Please try again.');
  }
}

export async function searchByAuthor(author: string): Promise<Book[]> {
  if (!author.trim()) {
    return [];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/search.json?author=${encodeURIComponent(author)}&limit=20`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment.');
      }
      throw new Error('Unable to search. Please try again.');
    }

    const data: OpenLibrarySearchResponse = await response.json();
    return data.docs.map(transformBook);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to search. Please try again.');
  }
}
