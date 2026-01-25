'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu } from '@base-ui/react/menu';
import Navigation from '@/components/Navigation';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import LoadingIndicator from '@/components/LoadingIndicator';
import { searchBooks } from '@/lib/api/openLibrary';
import { addRecentSearch } from '@/lib/utils/recentSearches';
import { separateDerivativeWorks } from '@/lib/utils/bookFilters';
import type { Book } from '@/lib/types/book';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDerivatives, setShowDerivatives] = useState(false);
  const saveToRecentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSuccessfulSearchRef = useRef<string>('');

  // Initialize query from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
    }
  }, []);

  // Update URL when query changes
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query.trim()) {
        // Update URL with search query
        const params = new URLSearchParams();
        params.set('q', query);
        router.push(`/search?${params.toString()}`, { scroll: false });
        performSearch(query);
      } else {
        // Clear URL params when query is empty
        router.push('/search', { scroll: false });
        setBooks([]);
        setError(null);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [query, router]);

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
            <h2 className="text-4xl font-bold text-warm-text mb-8">
              Search for Books
            </h2>
            <SearchBar value={query} onChange={setQuery} />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <LoadingIndicator size="lg" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <p className="text-warm-text-secondary">{error}</p>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && displayedBooks.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {displayedBooks.map((book) => (
                <BookCard key={book.id} book={book} showAddButton={true} showPublishYear={false} />
              ))}
            </div>
          )}

          {/* Filter Menu - Bottom Right */}
          {!loading && !error && books.length > 0 && derivativeWorks.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Menu.Root>
                <Menu.Trigger className="flex items-center gap-2 px-4 py-2 bg-warm-bg-secondary border border-warm-border rounded-lg shadow-lg hover:bg-warm-bg transition-colors text-sm text-warm-text">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Filter Results</span>
                  {!showDerivatives && (
                    <span className="px-2 py-0.5 bg-warm-text-secondary text-white text-xs rounded-full">
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
                    <Menu.Popup
                      className="min-w-[240px] border border-warm-border rounded-lg shadow-lg overflow-hidden"
                      style={{
                        backgroundColor: 'var(--color-bg-secondary)'
                      }}
                    >
                      <div className="px-4 py-3 border-b border-warm-border">
                        <p className="text-xs font-semibold text-warm-text-secondary uppercase tracking-wider">
                          Filter Options
                        </p>
                      </div>
                      <Menu.Item
                        onClick={(e) => {
                          e.preventDefault()
                          setShowDerivatives(!showDerivatives)
                        }}
                        closeOnClick={false}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-warm-bg transition-colors cursor-pointer outline-none data-[highlighted]:bg-warm-bg flex items-center justify-between gap-3"
                      >
                        <span className="text-warm-text">Show summaries & guides</span>
                        <div className={`relative w-9 h-5 rounded-full transition-colors flex items-center flex-shrink-0 ${
                          showDerivatives ? 'bg-warm-text-secondary' : 'bg-warm-border'
                        }`}>
                          <div className={`w-4 h-4 bg-warm-bg-secondary rounded-full shadow transition-transform transform ${
                            showDerivatives ? 'translate-x-[1.125rem]' : 'translate-x-0.5'
                          }`} />
                        </div>
                      </Menu.Item>
                      <div className="px-4 py-3 bg-warm-bg border-t border-warm-border">
                        <p className="text-xs text-warm-text-secondary">
                          Showing {displayedBooks.length} of {books.length} results
                          {!showDerivatives && derivativeWorks.length > 0 && (
                            <> ({derivativeWorks.length} hidden)</>
                          )}
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
                className="mx-auto h-16 w-16 text-warm-text-tertiary mb-4"
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
              <p className="text-warm-text-secondary">Start typing to search for books</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
