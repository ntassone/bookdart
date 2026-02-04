'use client'

import { useState } from 'react'
import CompactBookCard from './CompactBookCard'
import { Tooltip } from '@base-ui/react/tooltip'
import { Heart, X, PlusSquareIcon } from 'lucide-react'
import type { Book } from '@/lib/types/book'
import type { UserBook } from '@/lib/types/userBook'

interface FavoriteBooksEditorProps {
  favoriteBooks: Book[]
  onReorder?: (bookIds: string[]) => void
  onRemove?: (bookId: string) => void
  onAddClick?: () => void
  onBookAdded?: () => void
  showActions?: boolean
  bookStatuses?: Record<string, UserBook[]>
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
  bookStatuses,
}: FavoriteBooksEditorProps) {
  const [isHovering, setIsHovering] = useState<number | null>(null)

  // Always create 4 slots
  const slots = Array.from({ length: 4 }, (_, index) => {
    return favoriteBooks[index] || null
  })

  const canEdit = onReorder !== undefined && onRemove !== undefined && onAddClick !== undefined

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Heart className="w-4 h-4 text-warm-text-secondary" strokeWidth={1} />
        <h2 className="text-xs tracking-wide uppercase text-warm-text-tertiary">Favorite Books</h2>
      </div>
      <div className="flex gap-3">
        {slots.map((book, index) =>
          book ? (
            // Filled slot with book
            <div key={book.id} className="relative group w-[130px] flex-shrink-0">
              <CompactBookCard
                book={book}
                showAddButton={showActions}
                onBookAdded={onBookAdded}
                initialBookStatus={bookStatuses?.[book.id]}
              />
              {/* Remove Button - only show when editable */}
              {canEdit && onRemove && (
                <Tooltip.Root>
                  <Tooltip.Trigger>
                    <button
                      onClick={() => onRemove(book.id)}
                      className="absolute top-2 right-2 p-1.5 bg-warm-bg-secondary border border-warm-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-warm-bg z-20"
                    >
                      <X className="w-4 h-4 text-warm-text-secondary" />
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Positioner sideOffset={4}>
                      <Tooltip.Popup className="z-50 px-2 py-1 text-xs text-white bg-warm-text rounded transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                        Remove from favorites
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              )}
            </div>
          ) : (
            // Empty slot - blank placeholder
            <div key={`empty-${index}`} className="w-[130px] flex-shrink-0">
              {canEdit && onAddClick ? (
                <Tooltip.Root>
                  <Tooltip.Trigger
                    onClick={onAddClick}
                    onMouseEnter={() => setIsHovering(index)}
                    onMouseLeave={() => setIsHovering(null)}
                    className="relative flex items-center justify-center w-full overflow-hidden border cursor-pointer aspect-[2/3] bg-warm-bg bg-gradient-to-br border-transparent from-warm-bg/80 hover:from-warm-bg hover:border-warm-border to-transparent"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 8px)'
                    }}
                  >
                    {isHovering === index && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <PlusSquareIcon strokeWidth={1} className="w-6 h-6 text-warm-text-secondary" />
                      </div>
                    )}
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Positioner sideOffset={4}>
                      <Tooltip.Popup className="z-50 px-2 py-1 text-xs bg-warm-bg-secondary text-warm-text border border-warm-border transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                        Pick a favorite book
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ) : (
                <div
                  className="relative flex items-center justify-center w-full overflow-hidden border aspect-[2/3] bg-warm-bg bg-gradient-to-br border-transparent from-warm-bg/80 to-transparent"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.05) 1px, rgba(0,0,0,0.05) 8px)'
                  }}
                />
              )}
            </div>
          )
        )}
      </div>
    </div>
  )
}
