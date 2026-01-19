'use client'

import CompactBookCard from './CompactBookCard'
import { Tooltip } from '@base-ui/react/tooltip'
import type { Book } from '@/lib/types/book'

interface FavoriteBooksEditorProps {
  favoriteBooks: Book[]
  onReorder?: (bookIds: string[]) => void
  onRemove?: (bookId: string) => void
  onAddClick?: () => void
  onBookAdded?: () => void
  showActions?: boolean
}

/**
 * Billboard-style display of up to 4 favorite books
 * Shows large covers with ability to reorder and remove
 */
export default function FavoriteBooksEditor({
  favoriteBooks,
  onReorder,
  onRemove,
  onAddClick,
  onBookAdded,
  showActions = true,
}: FavoriteBooksEditorProps) {
  // Always create 4 slots
  const slots = Array.from({ length: 4 }, (_, index) => {
    return favoriteBooks[index] || null
  })

  const canEdit = onReorder !== undefined && onRemove !== undefined && onAddClick !== undefined

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-700">Favorites</h2>
      <div className="grid grid-cols-4 gap-6">
        {slots.map((book, index) =>
          book ? (
            // Filled slot with book
            <div key={book.id} className="relative group">
              <CompactBookCard
                book={book}
                showAddButton={showActions}
                onBookAdded={onBookAdded}
              />
              {/* Remove Button - only show when editable */}
              {canEdit && onRemove && (
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <button
                      onClick={() => onRemove(book.id)}
                      className="absolute top-2 right-2 p-1.5 bg-white border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-20"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Positioner sideOffset={4}>
                      <Tooltip.Popup className="bg-gray-800 text-white text-xs px-2 py-1 z-50">
                        Remove from favorites
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}
            </div>
          ) : (
            // Empty slot - blank placeholder
            <div key={`empty-${index}`}>
              {canEdit && onAddClick ? (
                <button
                  onClick={onAddClick}
                  className="aspect-[2/3] border border-gray-300 bg-gray-400 opacity-30 hover:opacity-40 transition-opacity w-full"
                  aria-label="Add favorite book"
                />
              ) : (
                <div className="aspect-[2/3] border border-gray-300 bg-gray-400 opacity-30" />
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
