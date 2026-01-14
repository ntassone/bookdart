'use client'

import BookCard from './BookCard'
import type { Book } from '@/lib/types/book'

interface CurrentlyReadingSectionProps {
  books: Book[]
  onBookAdded?: () => void
}

/**
 * Displays books the user is currently reading
 */
export default function CurrentlyReadingSection({ books, onBookAdded }: CurrentlyReadingSectionProps) {
  if (books.length === 0) {
    return null
  }

  return (
    <div className="border border-gray-200 p-6 bg-white">
      <h2 className="text-xl font-bold text-gray-700 mb-4">Currently Reading</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            showAddButton={true}
            onBookAdded={onBookAdded}
          />
        ))}
      </div>
    </div>
  )
}
