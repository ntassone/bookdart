'use client'

import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import LoadingIndicator from '@/components/LoadingIndicator'
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
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-warm-text border border-white border-opacity-20 w-full max-w-4xl max-h-[80vh] overflow-hidden z-50 flex flex-col">
          <div className="border-b border-white border-opacity-20 p-6">
            <Dialog.Title className="text-2xl font-bold text-white">
              Add to Favorites
            </Dialog.Title>
            <Dialog.Description className="text-sm text-white text-opacity-60 mt-2">
              Select a book from your library to add to your favorites
            </Dialog.Description>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center py-20">
                <LoadingIndicator size="lg" />
              </div>
            ) : availableBooks.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white text-opacity-60">
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
                      <div className="aspect-[2/3] bg-black bg-opacity-20 border border-white border-opacity-10 overflow-hidden mb-2">
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white bg-opacity-5">
                            <BookOpen className="w-8 h-8 text-white text-opacity-40" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-white line-clamp-2">{book.title}</p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-white border-opacity-20 p-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
