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
}

/**
 * Streamlined book card actions with icon buttons on hover
 * Icons reflect which list the book is in
 * Three independent lists:
 * - Want to Read: Books planned to read
 * - Currently Reading: Books actively reading
 * - Read: Books finished
 */
export default function BookCardActions({ book, onAdded }: BookCardActionsProps) {
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

    setLoading(true)
    try {
      const bookInList = userBooks.find(b => b.status === status)

      // If book is already in this list, remove it
      if (bookInList) {
        await removeBookFromLibrary(bookInList.id)
        setUserBooks(userBooks.filter(b => b.status !== status))

        // Update ReadBooksContext
        if (status === 'read') {
          removeReadBook(book.id)
        }

        const removeLabels: Record<BookStatus, string> = {
          'read': 'Removed from Read',
          'want-to-read': 'Removed from Want to Read',
          'reading': 'Removed from Currently Reading'
        }
        addToast(removeLabels[status], 'success')
        onAdded?.()
      } else {
        // Add it to this list
        await addBookToLibrary({
          book_id: book.id,
          status,
          title: book.title,
          authors: book.authors,
          publish_year: book.publishYear,
          cover_url: book.coverUrl,
          isbn: book.isbn,
        })
        // Refresh to get updated list status
        const updated = await getBookInLibrary(book.id)
        setUserBooks(updated)

        // Update ReadBooksContext
        if (status === 'read') {
          addReadBook(book.id)
        }

        const addLabels: Record<BookStatus, string> = {
          'read': 'Added to Read',
          'want-to-read': 'Added to Want to Read',
          'reading': 'Added to Currently Reading'
        }
        addToast(addLabels[status], 'success')
        onAdded?.()
      }
    } catch (error) {
      console.error('Failed to update list:', error)
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
      {/* Read checkbox - top right */}
      <div className="absolute top-2 right-2">
        <Tooltip.Root>
          <Tooltip.Trigger>
            <button
              onClick={(e) => handleQuickAction(e, 'read')}
              disabled={loading}
              className={`p-2 bg-white hover:bg-gray-50 border transition-all disabled:opacity-50 ${
                isRead ? 'border-gray-600' : 'border-gray-300'
              }`}
            >
              {isRead ? (
                // Checked checkbox when marked as read
                <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="5" y="5" width="14" height="14" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              ) : (
                // Empty square checkbox
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="5" y="5" width="14" height="14" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner sideOffset={4}>
              <Tooltip.Popup className="bg-gray-800 text-white text-xs px-2 py-1 z-50">
                {isRead ? 'Mark as unread' : 'Mark as read'}
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2">
        {/* Want to Read button - bottom left */}
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
                  <span className={isReading ? 'font-semibold' : ''}>Currently Reading</span>
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
