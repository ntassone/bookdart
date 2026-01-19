'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Tooltip } from '@base-ui/react/tooltip'
import type { Book } from '@/lib/types/book'
import BookCardActions from './BookCardActions'
import { generateBookUrl } from '@/lib/utils/bookUrl'
import { useUserPreferences } from '@/lib/contexts/UserPreferencesContext'
import { useReadBooks } from '@/lib/contexts/ReadBooksContext'

interface CompactBookCardProps {
  book: Book
  onClick?: () => void
  showAddButton?: boolean
  onBookAdded?: () => void
  hideWantToRead?: boolean
}

/**
 * Compact version of BookCard that hides title/author/year
 * and displays them in a tooltip instead
 */
export default function CompactBookCard({ book, onClick, showAddButton = false, onBookAdded, hideWantToRead = false }: CompactBookCardProps) {
  const router = useRouter()
  const { fadeCompletedBooks } = useUserPreferences()
  const { readBookIds } = useReadBooks()
  const authors = book.authors.join(', ') || 'Unknown Author'

  // Check if book is in the read list
  const isRead = readBookIds.has(book.id)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      // Navigate to book detail page with human-readable URL
      const url = generateBookUrl(book)
      router.push(url)
    }
  }

  return (
    <Tooltip.Root>
      <Tooltip.Trigger className="w-full">
        <div
          onClick={handleClick}
          className="bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all group cursor-pointer relative overflow-hidden w-full"
        >
          <div className="relative aspect-[2/3] bg-gray-100 overflow-hidden">
            {/* Faded image layer */}
            <div className={`absolute inset-0 transition-opacity ${isRead && fadeCompletedBooks ? 'opacity-40' : 'opacity-100'}`}>
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={`${book.title} cover`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-600 p-4">
                  <p className="text-gray-200 text-center text-lg font-bold line-clamp-6">
                    {book.title}
                  </p>
                </div>
              )}
            </div>

            {/* Hover darkening overlay */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

            {/* Dog-ear bookmark - visible only when marked as read */}
            {isRead && showAddButton && (
              <div className="absolute top-0 right-0 z-10">
                {/* Triangular shadow beneath dog-ear */}
                <div
                  className="absolute top-0 right-0 w-12 h-12 pointer-events-none"
                  style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)'
                  }}
                />

                <div className="relative w-12 h-12">
                  {/* Dog-ear fold effect */}
                  <div
                    className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none"
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
                  >
                    {/* Folded page */}
                    <div
                      className="absolute top-0 right-0 w-full h-full bg-gray-600"
                    />

                    {/* Shadow effect for depth */}
                    <div
                      className="absolute top-0 right-0 w-full h-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                      }}
                    />
                  </div>

                  {/* Checkmark icon */}
                  <div className="absolute top-1 right-1 pointer-events-none">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Dog-ear bookmark for non-action cards (profile pages, etc.) */}
            {isRead && !showAddButton && (
              <div className="absolute top-0 right-0 z-10 pointer-events-none">
                {/* Triangular shadow beneath dog-ear */}
                <div
                  className="absolute top-0 right-0 w-12 h-12"
                  style={{
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)'
                  }}
                />

                <div className="relative w-12 h-12">
                  {/* Dog-ear fold effect */}
                  <div
                    className="absolute top-0 right-0 w-12 h-12 overflow-hidden"
                    style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
                  >
                    {/* Folded page */}
                    <div
                      className="absolute top-0 right-0 w-full h-full bg-gray-600"
                    />

                    {/* Shadow effect for depth */}
                    <div
                      className="absolute top-0 right-0 w-full h-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                      }}
                    />
                  </div>

                  {/* Checkmark icon */}
                  <div className="absolute top-1 right-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons on hover - overlay on cover at full opacity */}
            {showAddButton && (
              <BookCardActions book={book} onAdded={onBookAdded} hideWantToRead={hideWantToRead} />
            )}
          </div>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8}>
          <Tooltip.Popup className="bg-gray-800 text-white px-3 py-2 max-w-[200px] z-50 rounded">
            <p className="font-semibold text-sm mb-1">{book.title}</p>
            <p className="text-xs text-gray-300">{authors}</p>
            {book.publishYear && (
              <p className="text-xs text-gray-400 mt-1">{book.publishYear}</p>
            )}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
