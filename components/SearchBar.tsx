'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@base-ui/react/input'
import { getRecentSearchesSync, removeRecentSearch, syncRecentSearches } from '@/lib/utils/recentSearches'
import { getRecentBooksSync, removeRecentBook, syncRecentBooks } from '@/lib/utils/recentBooks'
import MiniBookCard from '@/components/MiniBookCard'
import type { Book } from '@/lib/types/book'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

type TabType = 'searches' | 'books'

export default function SearchBar({ value, onChange, placeholder = 'Search for books...' }: SearchBarProps) {
  const router = useRouter()
  const [isFocused, setIsFocused] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('searches')
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [recentBooks, setRecentBooks] = useState<Book[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load from localStorage immediately
    const initialSearches = getRecentSearchesSync()
    const initialBooks = getRecentBooksSync()
    setRecentSearches(initialSearches)
    setRecentBooks(initialBooks)

    // Sync with database for authenticated users
    const syncData = async () => {
      await syncRecentSearches()
      await syncRecentBooks()
      // Update state with synced data
      setRecentSearches(getRecentSearchesSync())
      setRecentBooks(getRecentBooksSync())
    }
    syncData()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSearch = (search: string) => {
    onChange(search)
    setIsFocused(false)
  }

  const handleSelectBook = (book: Book) => {
    const urlSlug = book.id.replace('/works/', '')
    router.push(`/book/${book.author?.toLowerCase().replace(/\s+/g, '-')}/${urlSlug}`)
    setIsFocused(false)
  }

  const handleRemoveSearch = async (search: string) => {
    await removeRecentSearch(search)
    setRecentSearches(getRecentSearchesSync())
  }

  const handleRemoveBook = async (bookId: string) => {
    await removeRecentBook(bookId)
    setRecentBooks(getRecentBooksSync())
  }


  const showDropdown = isFocused && !value && (recentSearches.length > 0 || recentBooks.length > 0)

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <svg
          className="h-5 w-5 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <Input
        value={value}
        onValueChange={onChange}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className={({ focused }) => `
          w-full pl-12 pr-4 py-3 text-gray-700 bg-white border rounded-lg transition-all
          ${focused ? 'border-gray-400 ring-2 ring-gray-300 outline-none' : 'border-gray-300'}
        `}
      />

      {/* Recent Dropdown - Columns on Desktop, Tabs on Mobile */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
          {/* Mobile: Tabs - Only show if both sections have items */}
          {recentBooks.length > 0 && (
            <div className="md:hidden flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('searches')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'searches'
                    ? 'text-gray-700 border-b-2 border-gray-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Searches
              </button>
              <button
                onClick={() => setActiveTab('books')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'books'
                    ? 'text-gray-700 border-b-2 border-gray-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Recently Visited
              </button>
            </div>
          )}

          {/* Mobile: Tab Content */}
          <div className="md:hidden max-h-[400px] overflow-y-auto">
            {(activeTab === 'searches' || recentBooks.length === 0) && (
              <>
                {recentSearches.length > 0 ? (
                  <ul>
                    {recentSearches.map((search, index) => (
                      <li key={index} className="group">
                        <div className="flex items-center hover:bg-gray-50 transition-colors">
                          <button
                            onClick={() => handleSelectSearch(search)}
                            className="flex-1 px-4 py-3 text-left text-gray-700 flex items-center gap-3"
                          >
                            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{search}</span>
                          </button>
                          <button
                            onClick={() => handleRemoveSearch(search)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 mr-2 hover:bg-gray-200 rounded"
                            aria-label="Remove"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">
                    No recent searches
                  </div>
                )}
              </>
            )}

            {activeTab === 'books' && recentBooks.length > 0 && (
              <ul>
                {recentBooks.map((book) => (
                  <li key={book.id}>
                    <MiniBookCard
                      book={book}
                      onClick={() => handleSelectBook(book)}
                      onDismiss={() => handleRemoveBook(book.id)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Desktop: Column Layout */}
          <div className={`hidden md:grid max-h-[400px] overflow-hidden ${recentBooks.length > 0 ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>
            {/* Recent Searches Column */}
            <div className={`overflow-y-auto ${recentBooks.length > 0 ? 'border-r border-gray-200' : ''}`}>
              {recentSearches.length > 0 ? (
                <ul>
                  {recentSearches.map((search, index) => (
                    <li key={index} className="group">
                      <div className="flex items-center hover:bg-gray-50 transition-colors">
                        <button
                          onClick={() => handleSelectSearch(search)}
                          className="flex-1 px-4 py-3 text-left text-gray-700 flex items-center gap-3"
                        >
                          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="truncate">{search}</span>
                        </button>
                        <button
                          onClick={() => handleRemoveSearch(search)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 mr-2 hover:bg-gray-200 rounded"
                          aria-label="Remove"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No recent searches
                </div>
              )}
            </div>

            {/* Recently Visited Books Column - Only show if there are books */}
            {recentBooks.length > 0 && (
              <div className="overflow-y-auto">
                <ul>
                  {recentBooks.map((book) => (
                    <li key={book.id}>
                      <MiniBookCard
                        book={book}
                        onClick={() => handleSelectBook(book)}
                        onDismiss={() => handleRemoveBook(book.id)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
