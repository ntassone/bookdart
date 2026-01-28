'use client'

import React, { useState, useEffect } from 'react'
import { Minus, Plus, Check } from 'lucide-react'
import { Menu } from '@base-ui/react/menu'
import { Tooltip } from '@base-ui/react/tooltip'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/contexts/ToastContext'
import { useReadBooks } from '@/lib/contexts/ReadBooksContext'
import { useInverted } from '@/lib/contexts/InvertedContext'
import { addBookToLibrary, getBookInLibrary, removeBookFromLibrary } from '@/lib/api/userBooks'
import { generateBookUrl } from '@/lib/utils/bookUrl'
import type { Book } from '@/lib/types/book'
import type { BookStatus, UserBook } from '@/lib/types/userBook'

interface BookCardActionsProps {
  book: Book
  onAdded?: () => void
  hideWantToRead?: boolean
  initialStatus?: UserBook[]
  isMenuOpen?: boolean
  onMenuOpenChange?: (open: boolean) => void
}

/**
 * Streamlined book card actions with icon buttons on hover
 * Icons reflect which list the book is in
 * Three independent lists:
 * - Want to Read: Books planned to read
 * - Reading Now: Books actively reading
 * - Read: Books finished
 */
const BookCardActions = React.memo(function BookCardActions({ book, onAdded, hideWantToRead = false, initialStatus, isMenuOpen = false, onMenuOpenChange }: BookCardActionsProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const { addReadBook, removeReadBook } = useReadBooks()
  const { inverted } = useInverted()
  const [loading, setLoading] = useState(false)
  const [userBooks, setUserBooks] = useState<UserBook[]>(initialStatus || [])

  useEffect(() => {
    // Only fetch if initialStatus was not provided
    if (user && initialStatus === undefined) {
      getBookInLibrary(book.id).then(setUserBooks).catch(() => setUserBooks([]))
    }
  }, [user, book.id, initialStatus])

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
    <React.Fragment>
      {/* Read dog-ear - always visible with checkmark, shows minus on hover */}
      {isRead && (
        <div className="absolute top-1 right-0.5 z-20 pointer-events-auto">
          <Tooltip.Root>
            <Tooltip.Trigger>
              <button
                onClick={(e) => handleQuickAction(e, 'read')}
                disabled={loading}
                className="relative disabled:opacity-50 group/dogear-remove"
              >
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                  {/* Background blocker to prevent bleed-through */}
                  <path
                    d="M31.6765 0.5C32.7811 0.5 33.6765 1.39543 33.6765 2.5V31.6716C33.6765 33.4534 31.5222 34.3457 30.2623 33.0858L1.09072 3.91421C-0.169206 2.65428 0.723131 0.5 2.50494 0.5H31.6765Z"
                    fill="#000000"
                  />
                  {/* Dark neutral triangle with white border, red on hover */}
                  <path
                    d="M31.6765 0.5C32.7811 0.5 33.6765 1.39543 33.6765 2.5V31.6716C33.6765 33.4534 31.5222 34.3457 30.2623 33.0858L1.09072 3.91421C-0.169206 2.65428 0.723131 0.5 2.50494 0.5H31.6765Z"
                    className="transition-all fill-neutral-800 group-hover/dogear-remove:fill-red-600"
                    strokeWidth=".75"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Checkmark - always visible, hidden on hover */}
                <Check
                  className="absolute w-4 h-4 text-white transition-opacity top-1 right-1.5 group-hover/dogear-remove:opacity-0"
                  strokeWidth={1}
                />
                {/* Minus icon - shown on button hover only */}
                <Minus
                  className="absolute w-4 h-4 text-white transition-opacity opacity-0 top-1 right-1.5 group-hover/dogear-remove:opacity-100"
                  strokeWidth={1}
                />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Positioner sideOffset={4}>
                <Tooltip.Popup className={`z-50 px-2 py-1 text-xs transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${
                  inverted ? 'bg-warm-bg-secondary text-warm-text border border-warm-border' : 'bg-warm-text text-white'
                }`}>
                  Mark as unread
                </Tooltip.Popup>
              </Tooltip.Positioner>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>
      )}

      {/* Hover-activated actions - stays visible when menu is open */}
      <div className={`absolute inset-0 transition-opacity pointer-events-none ${
        isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto'
      }`}>
        {/* Unread dog-ear - shows on card hover */}
        {!isRead && (
          <div className="absolute top-1 right-0.5 z-20">
            <Tooltip.Root>
              <Tooltip.Trigger>
                <button
                  onClick={(e) => handleQuickAction(e, 'read')}
                  disabled={loading}
                  className="relative transition-opacity disabled:opacity-50 group/dogear-add"
                >
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    {/* Dark neutral triangle with subtle white border */}
                    <path
                      d="M31.6765 0.5C32.7811 0.5 33.6765 1.39543 33.6765 2.5V31.6716C33.6765 33.4534 31.5222 34.3457 30.2623 33.0858L1.09072 3.91421C-0.169206 2.65428 0.723131 0.5 2.50494 0.5H31.6765Z"
                      className="transition-all fill-neutral-800 group-hover/dogear-add:fill-neutral-900"
                      strokeWidth=".75"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* White checkmark icon */}
                  <Plus
                    className="absolute w-4 h-4 text-white top-1 right-1.5"
                    strokeWidth={1}
                  />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner sideOffset={4}>
                  <Tooltip.Popup className={`z-50 px-2 py-1 text-xs rounded transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${
                    inverted ? 'bg-warm-bg-secondary text-warm-text border border-warm-border' : 'bg-warm-text text-white'
                  }`}>
                    Mark as read
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </div>
        )}

      <div className="absolute flex items-center justify-between gap-2 bottom-2 left-2 right-2">
        {/* Want to Read button - bottom left */}
        {!hideWantToRead && (
          <button
            onClick={(e) => handleQuickAction(e, 'want-to-read')}
            disabled={loading}
            className={`px-3 py-2 bg-warm-bg-secondary hover:bg-warm-bg border text-sm font-medium transition-all disabled:opacity-50 flex items-center gap-2 ${
              isWantToRead ? 'border-warm-text text-warm-text' : 'border-warm-border text-warm-text-secondary'
            }`}
          >
            {isWantToRead ? (
              <>
                <Minus className="w-4 h-4" />
                Remove
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Want to read
              </>
            )}
          </button>
        )}

        {/* More Options Menu - bottom right */}
        <Menu.Root onOpenChange={onMenuOpenChange}>
          <Menu.Trigger
            onClick={(e) => e.stopPropagation()}
            className="p-2 transition-all border bg-warm-bg-secondary hover:bg-warm-bg border-warm-border disabled:opacity-50"
            disabled={loading}
          >
            <svg
              className="w-4 h-4 text-warm-text-secondary"
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
              <Menu.Popup className={`min-w-[180px] overflow-hidden transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 ${
                inverted ? 'bg-warm-bg-secondary border border-warm-border' : 'bg-warm-text border border-white border-opacity-20'
              }`}>
                <Menu.Item
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleList('reading')
                  }}
                  disabled={loading}
                  className={`w-full px-4 py-2 text-left text-sm disabled:opacity-50 transition-colors cursor-pointer outline-none flex items-center gap-2 ${
                    inverted
                      ? 'text-warm-text hover:bg-warm-bg data-[highlighted]:bg-warm-bg'
                      : 'text-white hover:bg-white hover:bg-opacity-10 data-[highlighted]:bg-white data-[highlighted]:bg-opacity-10'
                  }`}
                >
                  {isReading && (
                    <Check className={`w-3 h-3 ${inverted ? 'text-warm-text-secondary' : 'text-white text-opacity-60'}`} />
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
                  className={`w-full px-4 py-2 text-left text-sm disabled:opacity-50 transition-colors cursor-pointer outline-none ${
                    inverted
                      ? 'text-warm-text hover:bg-warm-bg data-[highlighted]:bg-warm-bg'
                      : 'text-white hover:bg-white hover:bg-opacity-10 data-[highlighted]:bg-white data-[highlighted]:bg-opacity-10'
                  }`}
                >
                  View Details
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
        </div>
      </div>
    </React.Fragment>
  )
});

export default BookCardActions;
