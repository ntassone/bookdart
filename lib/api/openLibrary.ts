import type { OpenLibrarySearchResponse, OpenLibraryBook, Book } from '../types/book';
import { extractYear } from '@/lib/utils/dateUtils';
import { getCachedBooks, cacheBooks } from './bookCache';

const BASE_URL = 'https://openlibrary.org';

function transformBook(olBook: OpenLibraryBook): Book {
  return {
    id: olBook.key,
    title: olBook.title,
    authors: olBook.author_name || [],
    publishYear: extractYear(olBook.first_publish_year),
    coverUrl: olBook.cover_i ? getCoverUrl(olBook.cover_i, 'L') : undefined,
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
    const books = data.docs.map(transformBook);

    // Check cache for existing books
    const bookIds = books.map(b => b.id);
    const cachedBooks = await getCachedBooks(bookIds);

    // Merge cached data with fresh data (prefer cached for better quality)
    const mergedBooks = books.map(book => {
      const cached = cachedBooks.get(book.id);
      return cached || book;
    });

    // Cache the new/updated books in the background
    const booksToCache = books.filter(book => !cachedBooks.has(book.id));
    if (booksToCache.length > 0) {
      // Don't await - cache in background
      cacheBooks(booksToCache).catch(err => console.error('Cache error:', err));
    }

    return mergedBooks;
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
    const books = data.docs.map(transformBook);

    // Check cache for existing books
    const bookIds = books.map(b => b.id);
    const cachedBooks = await getCachedBooks(bookIds);

    // Merge cached data with fresh data (prefer cached for better quality)
    const mergedBooks = books.map(book => {
      const cached = cachedBooks.get(book.id);
      return cached || book;
    });

    // Cache the new/updated books in the background
    const booksToCache = books.filter(book => !cachedBooks.has(book.id));
    if (booksToCache.length > 0) {
      cacheBooks(booksToCache).catch(err => console.error('Cache error:', err));
    }

    return mergedBooks;
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
    const books = data.docs.map(transformBook);

    // Check cache for existing books
    const bookIds = books.map(b => b.id);
    const cachedBooks = await getCachedBooks(bookIds);

    // Merge cached data with fresh data (prefer cached for better quality)
    const mergedBooks = books.map(book => {
      const cached = cachedBooks.get(book.id);
      return cached || book;
    });

    // Cache the new/updated books in the background
    const booksToCache = books.filter(book => !cachedBooks.has(book.id));
    if (booksToCache.length > 0) {
      cacheBooks(booksToCache).catch(err => console.error('Cache error:', err));
    }

    return mergedBooks;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unable to search. Please try again.');
  }
}
