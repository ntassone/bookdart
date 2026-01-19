'use client'

import CompactBookCard from './CompactBookCard'
import type { Book } from '@/lib/types/book'

interface CurrentlyReadingSectionProps {
  books: Book[]
  onBookAdded?: () => void
}

/**
 * Displays books the user is currently reading
 */
export default function CurrentlyReadingSection({ books, onBookAdded }: CurrentlyReadingSectionProps) {
  // Show the first book or a placeholder
  const currentBook = books[0] || null

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700 whitespace-nowrap">Reading Now</h2>
      {currentBook ? (
        <CompactBookCard
          key={currentBook.id}
          book={currentBook}
          showAddButton={true}
          onBookAdded={onBookAdded}
          hideWantToRead={true}
        />
      ) : (
        // Empty placeholder matching favorite book style
        <div className="aspect-[2/3] border border-gray-300 bg-gray-400 opacity-30" />
      )}
    </div>
  )
}
