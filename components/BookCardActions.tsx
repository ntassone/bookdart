'use client'

import { useState, useEffect } from 'react'
import { Menu } from '@base-ui/react/menu'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { addBookToLibrary, getBookInLibrary, removeBookFromLibrary } from '@/lib/api/userBooks'
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
  const [loading, setLoading] = useState(false)
  const [userBook, setUserBook] = useState<UserBook | null>(null)

  useEffect(() => {
    if (user) {
      getBookInLibrary(book.id).then(setUserBook).catch(() => setUserBook(null))
    }
  }, [user, book.id])

  const handleToggleList = async (status: BookStatus) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    try {
      // If book is already in this list, remove it
      if (userBook?.status === status) {
        await removeBookFromLibrary(userBook.id)
        setUserBook(null)
        onAdded?.()
      } else {
        // Otherwise, add it to this list (or move it from another list)
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
        setUserBook(updated)
        onAdded?.()
      }
    } catch (error) {
      console.error('Failed to update list:', error)
      alert(error instanceof Error ? error.message : 'Failed to update list')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (e: React.MouseEvent, status: BookStatus) => {
    e.stopPropagation()
    await handleToggleList(status)
  }

  const isWantToRead = userBook?.status === 'want-to-read'
  const isRead = userBook?.status === 'read'
  const isReading = userBook?.status === 'reading'

  return (
    <div className="flex items-center gap-1 p-2" onClick={(e) => e.stopPropagation()}>
      {/* Want to Read List - Book icon */}
      <button
        onClick={(e) => handleQuickAction(e, 'want-to-read')}
        disabled={loading}
        className={`p-2 bg-white/90 hover:bg-white border rounded-lg transition-all disabled:opacity-50 group/btn ${
          isWantToRead ? 'border-gray-600 bg-gray-50' : 'border-gray-200'
        }`}
        title={isWantToRead ? 'Remove from Want to Read' : 'Add to Want to Read'}
      >
        <svg
          className={`w-4 h-4 group-hover/btn:text-gray-700 ${
            isWantToRead ? 'text-gray-700' : 'text-gray-600'
          }`}
          fill={isWantToRead ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      </button>

      {/* Read List - Check icon */}
      <button
        onClick={(e) => handleQuickAction(e, 'read')}
        disabled={loading}
        className={`p-2 bg-white/90 hover:bg-white border rounded-lg transition-all disabled:opacity-50 group/btn ${
          isRead ? 'border-gray-600 bg-gray-50' : 'border-gray-200'
        }`}
        title={isRead ? 'Remove from Read' : 'Add to Read'}
      >
        <svg
          className={`w-4 h-4 group-hover/btn:text-gray-700 ${
            isRead ? 'text-gray-700' : 'text-gray-600'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isRead ? 3 : 2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </button>

      {/* More Options Menu */}
      <Menu.Root>
        <Menu.Trigger
          className="p-2 bg-white/90 hover:bg-white border border-gray-200 rounded-lg transition-all disabled:opacity-50 group/btn"
          disabled={loading}
          title="More Options"
        >
          <svg
            className="w-4 h-4 text-gray-600 group-hover/btn:text-gray-700"
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
            alignment="end"
            sideOffset={4}
            className="z-50"
          >
            <Menu.Popup className="min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
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
                  const urlId = book.id.replace('/works/', 'works-')
                  router.push(`/book/${urlId}`)
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
  )
}
