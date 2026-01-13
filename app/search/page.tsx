'use client';

import { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import { searchBooks } from '@/lib/api/openLibrary';
import { addRecentSearch } from '@/lib/utils/recentSearches';
import type { Book } from '@/lib/types/book';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveToRecentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSuccessfulSearchRef = useRef<string>('');

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        performSearch(query, false); // Don't save immediately
      } else {
        setBooks([]);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query]);

  const performSearch = async (searchQuery: string, shouldSaveToRecent: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const results = await searchBooks(searchQuery);
      setBooks(results);

      if (results.length === 0) {
        setError(`No books found for "${searchQuery}"`);
      } else {
        // Store the successful search
        lastSuccessfulSearchRef.current = searchQuery;

        // Clear any existing timeout
        if (saveToRecentTimeoutRef.current) {
          clearTimeout(saveToRecentTimeoutRef.current);
        }

        // Only save to recent searches after user stops typing for 2 seconds
        // This ensures we only save the final search term
        saveToRecentTimeoutRef.current = setTimeout(() => {
          if (lastSuccessfulSearchRef.current === searchQuery && searchQuery.trim().length >= 3) {
            addRecentSearch(searchQuery);
          }
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to search. Please try again.');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      {/* Search Section */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-4xl font-bold text-gray-700 mb-8">
              Search for Books
            </h2>
            <SearchBar value={query} onChange={setQuery} />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && books.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} showAddButton={true} />
              ))}
            </div>
          )}

          {/* Initial Empty State */}
          {!loading && !error && !query && books.length === 0 && (
            <div className="text-center py-20">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-gray-600">Start typing to search for books</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
