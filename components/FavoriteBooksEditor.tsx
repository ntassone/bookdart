'use client'

import { useState } from 'react'
import { Tooltip } from '@base-ui/react/tooltip'
import type { Book } from '@/lib/types/book'

interface FavoriteBooksEditorProps {
  favoriteBooks: Book[]
  onReorder: (bookIds: string[]) => void
  onRemove: (bookId: string) => void
  onAddClick: () => void
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
}: FavoriteBooksEditorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFavorites = [...favoriteBooks]
    const draggedBook = newFavorites[draggedIndex]
    newFavorites.splice(draggedIndex, 1)
    newFavorites.splice(index, 0, draggedBook)

    onReorder(newFavorites.map(book => book.id))
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="border border-gray-200 p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-700">Favorite Books</h2>
        <p className="text-sm text-gray-600">{favoriteBooks.length} / 4</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {favoriteBooks.map((book, index) => (
          <div
            key={book.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className="relative group cursor-move"
          >
            {/* Book Cover */}
            <div className="aspect-[2/3] bg-white border border-gray-200 overflow-hidden">
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              )}
            </div>

            {/* Remove Button */}
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => onRemove(book.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white border border-gray-300 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
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

            {/* Book Info on Hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-2">
              <p className="text-sm font-medium text-gray-700 line-clamp-2">{book.title}</p>
              {book.authors && book.authors.length > 0 && (
                <p className="text-xs text-gray-600 line-clamp-1">{book.authors[0]}</p>
              )}
            </div>
          </div>
        ))}

        {/* Add Favorite Button */}
        {favoriteBooks.length < 4 && (
          <button
            onClick={onAddClick}
            className="aspect-[2/3] border-2 border-dashed border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">Add Favorite</span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Drag to reorder your favorites
      </p>
    </div>
  )
}
