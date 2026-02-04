'use client'

import { useEffect, useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import BookCard from './BookCard'
import LoadingIndicator from './LoadingIndicator'
import { InvertedProvider } from '@/lib/contexts/InvertedContext'
import { getBooksInLibrary } from '@/lib/api/userBooks'
import type { Book } from '@/lib/types/book'
import type { UserBook } from '@/lib/types/userBook'

interface BookSearchResultsProps {
  books: Book[]
  loading: boolean
  error: string | null
  query: string
  onBookAdded?: () => void
  // Styling customization
  gridClassName?: string
  loadingClassName?: string
  emptyStateClassName?: string
  errorClassName?: string
  // Text customization
  emptyStateText?: string
  // Theme for different contexts
  theme?: 'light' | 'dark'
}

/**
 * Reusable book search results component
 * Displays books in a grid using BookCard with consistent behavior
 */
export default function BookSearchResults({
  books,
  loading,
  error,
  query,
  onBookAdded,
  gridClassName = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6',
  loadingClassName = 'flex justify-center items-center py-20',
  emptyStateClassName = 'text-center py-20',
  errorClassName = 'text-center py-20',
  emptyStateText = 'Start typing to search for books',
  theme = 'light',
}: BookSearchResultsProps) {
  const [bookStatuses, setBookStatuses] = useState<Record<string, UserBook[]>>({})

  // Batch fetch book statuses for displayed books
  useEffect(() => {
    const fetchBookStatuses = async () => {
      if (books.length === 0) {
        setBookStatuses({})
        return
      }

      try {
        const bookIds = books.map(book => book.id)
        const statuses = await getBooksInLibrary(bookIds)
        setBookStatuses(statuses)
      } catch (error) {
        console.error('Failed to fetch book statuses:', error)
        setBookStatuses({})
      }
    }

    fetchBookStatuses()
  }, [books])

  // Loading State
  if (loading) {
    return (
      <div className={loadingClassName}>
        <LoadingIndicator size="lg" />
      </div>
    )
  }

  // Error State
  if (error && !loading) {
    const textColorClass = theme === 'dark' ? 'text-white text-opacity-60' : 'text-warm-text-secondary'
    return (
      <div className={errorClassName}>
        <p className={textColorClass}>{error}</p>
      </div>
    )
  }

  // Empty State (no query yet)
  if (!query && books.length === 0) {
    const iconColorClass = theme === 'dark' ? 'text-white text-opacity-20' : 'text-warm-text-tertiary'
    const textColorClass = theme === 'dark' ? 'text-white text-opacity-60' : 'text-warm-text-secondary'

    return (
      <div className={emptyStateClassName}>
        <SearchIcon className={`w-12 h-12 ${iconColorClass} mx-auto mb-4`} />
        <p className={textColorClass}>{emptyStateText}</p>
      </div>
    )
  }

  // No results for query
  if (query && books.length === 0 && !loading) {
    const textColorClass = theme === 'dark' ? 'text-white text-opacity-60' : 'text-warm-text-secondary'
    return (
      <div className={errorClassName}>
        <p className={textColorClass}>
          No books found. Try a different search.
        </p>
      </div>
    )
  }

  // Results Grid
  return (
    <InvertedProvider inverted={theme === 'dark'}>
      <div className={gridClassName}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            showAddButton={true}
            initialBookStatus={bookStatuses[book.id]}
            onBookAdded={onBookAdded}
          />
        ))}
      </div>
    </InvertedProvider>
  )
}
