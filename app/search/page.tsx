'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Menu } from '@base-ui/react/menu';
import Navigation from '@/components/Navigation';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import { searchBooks } from '@/lib/api/openLibrary';
import { addRecentSearch } from '@/lib/utils/recentSearches';
import { separateDerivativeWorks } from '@/lib/utils/bookFilters';
import type { Book } from '@/lib/types/book';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDerivatives, setShowDerivatives] = useState(false);
  const saveToRecentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSuccessfulSearchRef = useRef<string>('');

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setBooks([]);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query]);

  // Separate books into original works and derivative works
  const { originalWorks, derivativeWorks } = useMemo(() => {
    return separateDerivativeWorks(books);
  }, [books]);

  // Show original works by default, add derivatives if toggle is on
  const displayedBooks = useMemo(() => {
    return showDerivatives ? books : originalWorks;
  }, [books, originalWorks, showDerivatives]);

  const performSearch = async (searchQuery: string) => {
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
          {!loading && !error && displayedBooks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayedBooks.map((book) => (
                <BookCard key={book.id} book={book} showAddButton={true} />
              ))}
            </div>
          )}

          {/* Filter Menu - Bottom Right */}
          {!loading && !error && books.length > 0 && derivativeWorks.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Menu.Root>
                <Menu.Trigger className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors text-sm text-gray-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filter Results</span>
                  {!showDerivatives && (
                    <span className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded-full">
                      {derivativeWorks.length}
                    </span>
                  )}
                </Menu.Trigger>

                <Menu.Portal>
                  <Menu.Positioner
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="z-50"
                  >
                    <Menu.Popup className="min-w-[240px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Filter Options
                        </p>
                      </div>
                      <Menu.Item
                        onClick={() => setShowDerivatives(!showDerivatives)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors cursor-pointer outline-none data-[highlighted]:bg-gray-50 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                            showDerivatives ? 'bg-gray-600 border-gray-600' : 'border-gray-300'
                          }`}>
                            {showDerivatives && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-gray-700">Show summaries & guides</span>
                        </div>
                        {!showDerivatives && (
                          <span className="text-xs text-gray-500">
                            {derivativeWorks.length} hidden
                          </span>
                        )}
                      </Menu.Item>
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          Showing {displayedBooks.length} of {books.length} results
                        </p>
                      </div>
                    </Menu.Popup>
                  </Menu.Positioner>
                </Menu.Portal>
              </Menu.Root>
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
