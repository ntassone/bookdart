'use client'

import { useState, useEffect } from 'react'
import { Menu } from '@base-ui/react/menu'
import { Tooltip } from '@base-ui/react/tooltip'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/contexts/ToastContext'
import { useReadBooks } from '@/lib/contexts/ReadBooksContext'
import { addBookToLibrary, getBookInLibrary, removeBookFromLibrary } from '@/lib/api/userBooks'
import { generateBookUrl } from '@/lib/utils/bookUrl'
import type { Book } from '@/lib/types/book'
import type { BookStatus, UserBook } from '@/lib/types/userBook'

interface BookCardActionsProps {
  book: Book
  onAdded?: () => void
  hideWantToRead?: boolean
}

/**
 * Streamlined book card actions with icon buttons on hover
 * Icons reflect which list the book is in
 * Three independent lists:
 * - Want to Read: Books planned to read
 * - Reading Now: Books actively reading
 * - Read: Books finished
 */
export default function BookCardActions({ book, onAdded, hideWantToRead = false }: BookCardActionsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const { addReadBook, removeReadBook } = useReadBooks()
  const [loading, setLoading] = useState(false)
  const [userBooks, setUserBooks] = useState<UserBook[]>([])

  useEffect(() => {
    if (user) {
      getBookInLibrary(book.id).then(setUserBooks).catch(() => setUserBooks([]))
    }
  }, [user, book.id])

  const handleToggleList = async (status: BookStatus) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    const bookInList = userBooks.find(b => b.status === status)

    // Optimistic update - update UI immediately
    if (bookInList) {
      // Remove from list optimistically
      setUserBooks(userBooks.filter(b => b.status !== status))
      if (status === 'read') {
        removeReadBook(book.id)
      }
    } else {
      // Add to list optimistically
      const optimisticBook: UserBook = {
        id: 'temp-' + Date.now(),
        user_id: user.id,
        book_id: book.id,
        status,
        title: book.title,
        authors: book.authors,
        publish_year: book.publishYear,
        cover_url: book.coverUrl,
        isbn: book.isbn,
        date_added: new Date().toISOString(),
        is_review_public: false,
        read_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      setUserBooks([...userBooks, optimisticBook])
      if (status === 'read') {
        addReadBook(book.id)
      }
    }

    // Now make the actual API call
    setLoading(true)
    try {
      if (bookInList) {
        await removeBookFromLibrary(bookInList.id)
        const removeLabels: Record<BookStatus, string> = {
          'read': 'Removed from Read',
          'want-to-read': 'Removed from Want to Read',
          'reading': 'Removed from Reading Now'
        }
        addToast(removeLabels[status], 'success')
      } else {
        await addBookToLibrary({
          book_id: book.id,
          status,
          title: book.title,
          authors: book.authors,
          publish_year: book.publishYear,
          cover_url: book.coverUrl,
          isbn: book.isbn,
        })
        const addLabels: Record<BookStatus, string> = {
          'read': 'Added to Read',
          'want-to-read': 'Added to Want to Read',
          'reading': 'Added to Reading Now'
        }
        addToast(addLabels[status], 'success')
      }

      // Refresh to get the real data from server
      const updated = await getBookInLibrary(book.id)
      setUserBooks(updated)
      onAdded?.()
    } catch (error) {
      console.error('Failed to update list:', error)

      // Revert optimistic update on error
      if (bookInList) {
        setUserBooks([...userBooks, bookInList])
        if (status === 'read') {
          addReadBook(book.id)
        }
      } else {
        setUserBooks(userBooks.filter(b => b.status !== status))
        if (status === 'read') {
          removeReadBook(book.id)
        }
      }

      addToast(error instanceof Error ? error.message : 'Failed to update list', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (e: React.MouseEvent, status: BookStatus) => {
    e.stopPropagation()
    await handleToggleList(status)
  }

  const isWantToRead = userBooks.some(b => b.status === 'want-to-read')
  const isRead = userBooks.some(b => b.status === 'read')
  const isReading = userBooks.some(b => b.status === 'reading')

  return (
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
      {/* Read actions - top right */}
      {!isRead ? (
        /* Dog-ear for marking as read */
        <div className="absolute top-0 right-0 z-20">
          <Tooltip.Root>
            <Tooltip.Trigger>
              <button
                onClick={(e) => handleQuickAction(e, 'read')}
                disabled={loading}
                className="relative w-12 h-12 disabled:opacity-50 group/dogear-add"
              >
                {/* Dog-ear fold effect */}
                <div
                  className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none"
                  style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}
                >
                  {/* Folded page */}
                  <div className="absolute top-0 right-0 w-full h-full bg-gray-400 transition-colors" />

                  {/* Shadow effect for depth */}
                  <div
                    className="absolute top-0 right-0 w-full h-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
                    }}
                  />
                </div>

                {/* Checkmark icon */}
                <div className="absolute top-1 right-1 pointer-events-none opacity-40 group-hover/dogear-add:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={4}>
                <Tooltip.Popup className="bg-gray-800 text-white text-xs px-2 py-1 z-50">
                  Mark as read
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      ) : (
        /* Clickable overlay on dog-ear for unmarking */
        <div className="absolute top-0 right-0 z-20">
          <Tooltip.Root>
            <Tooltip.Trigger>
              <button
                onClick={(e) => handleQuickAction(e, 'read')}
                disabled={loading}
                className="relative w-12 h-12 disabled:opacity-50 hover:opacity-80 transition-opacity"
              >
                {/* Invisible clickable area */}
                <span className="sr-only">Mark as unread</span>
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={4}>
                <Tooltip.Popup className="bg-gray-800 text-white text-xs px-2 py-1 z-50">
                  Mark as unread
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      )}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
        {/* Want to Read button - bottom left */}
        {!hideWantToRead && (
          <button
            onClick={(e) => handleQuickAction(e, 'want-to-read')}
            disabled={loading}
            className={`px-3 py-2 bg-white hover:bg-gray-50 border text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${
              isWantToRead ? 'border-gray-600 text-gray-700' : 'border-gray-300 text-gray-600'
            }`}
          >
            {isWantToRead ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
                Remove
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Want to read
              </>
            )}
          </button>
        )}

        {/* More Options Menu - bottom right */}
        <Menu.Root>
          <Menu.Trigger
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white hover:bg-gray-50 border border-gray-300 transition-all disabled:opacity-50"
            disabled={loading}
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
              />
            </svg>
          </Menu.Trigger>

          <Menu.Portal>
            <Menu.Positioner
              side="bottom"
              align="end"
              sideOffset={4}
              className="z-50"
            >
              <Menu.Popup className="min-w-[180px] bg-white border border-gray-200 overflow-hidden">
                <Menu.Item
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleList('reading')
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer outline-none data-[highlighted]:bg-gray-50 flex items-center gap-2"
                >
                  {isReading && (
                    <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={isReading ? 'font-semibold' : ''}>Reading Now</span>
                </Menu.Item>
                <Menu.Item
                  onClick={(e) => {
                    e.stopPropagation()
                    const url = generateBookUrl(book)
                    router.push(url)
                  }}
                  disabled={loading}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer outline-none data-[highlighted]:bg-gray-50"
                >
                  View Details
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        </div>
    </div>
  )
}
