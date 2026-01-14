'use client'

import Image from 'next/image'
import type { Book } from '@/lib/types/book'

interface MiniBookCardProps {
  book: Book
  onClick: () => void
  onDismiss: () => void
}

export default function MiniBookCard({ book, onClick, onDismiss }: MiniBookCardProps) {
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDismiss()
  }

  // Support both naming conventions for cover URL
  const coverUrl = book.cover_url || book.coverUrl
  // Support both single author and authors array
  const authorName = book.author || (book.authors && book.authors.length > 0 ? book.authors[0] : undefined)

  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 group"
    >
      <div className="relative flex-shrink-0 w-10 h-14 bg-gray-200 rounded overflow-hidden">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={book.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{book.title}</p>
        {authorName && (
          <p className="text-xs text-gray-500 truncate">{authorName}</p>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
        aria-label="Remove"
      >
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </button>
  )
}
