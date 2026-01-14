'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import BookCard from './BookCard'
import type { Book } from '@/lib/types/book'
import type { UserBook } from '@/lib/types/userBook'
import { getUserBooks } from '@/lib/api/userBooks'

interface AddFavoriteModalProps {
  open: boolean
  onClose: () => void
  onSelect: (book: Book) => void
  currentFavorites: string[]
}

/**
 * Modal for selecting a book from the user's library to add to favorites
 */
export default function AddFavoriteModal({
  open,
  onClose,
  onSelect,
  currentFavorites,
}: AddFavoriteModalProps) {
  const [books, setBooks] = useState<UserBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadBooks()
    }
  }, [open])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const data = await getUserBooks()
      setBooks(data)
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const convertToBook = (userBook: UserBook): Book => ({
    id: userBook.book_id,
    title: userBook.title,
    authors: userBook.authors,
    publishYear: userBook.publish_year,
    coverUrl: userBook.cover_url,
    isbn: userBook.isbn,
  })

  // Filter out books already in favorites
  const availableBooks = books.filter(book => !currentFavorites.includes(book.book_id))

  return (
    <Dialog.Root open={open} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-200 w-full max-w-4xl max-h-[80vh] overflow-hidden z-50 flex flex-col">
          <div className="border-b border-gray-200 p-6">
            <Dialog.Title className="text-2xl font-bold text-gray-700">
              Add to Favorites
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mt-2">
              Select a book from your library to add to your favorites
            </Dialog.Description>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin h-12 w-12 border-b-2 border-gray-600"></div>
              </div>
            ) : availableBooks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600">
                  No books available. Add books to your library first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {availableBooks.map((userBook) => {
                  const book = convertToBook(userBook)
                  return (
                    <button
                      key={book.id}
                      onClick={() => {
                        onSelect(book)
                        onClose()
                      }}
                      className="text-left hover:opacity-80 transition-opacity"
                    >
                      <div className="aspect-[2/3] bg-white border border-gray-200 overflow-hidden mb-2">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700 line-clamp-2">{book.title}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 p-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
