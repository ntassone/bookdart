'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import { getUserBooks, removeBookFromLibrary, updateUserBook } from '@/lib/api/userBooks'
import type { UserBook, BookStatus } from '@/lib/types/userBook'
import Image from 'next/image'

export default function MyBooksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<UserBook[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<BookStatus | 'all'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadBooks()
    }
  }, [user, filter])

  const loadBooks = async () => {
    setLoading(true)
    try {
      const data = await getUserBooks(filter === 'all' ? undefined : filter)
      setBooks(data)
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookId: string, newStatus: BookStatus) => {
    try {
      await updateUserBook(bookId, { status: newStatus })
      await loadBooks()
    } catch (error) {
      console.error('Failed to update book:', error)
    }
  }

  const handleRemove = async (bookId: string) => {
    if (!confirm('Remove this book from your library?')) return

    try {
      await removeBookFromLibrary(bookId)
      await loadBooks()
    } catch (error) {
      console.error('Failed to remove book:', error)
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-700 mb-4">My Books</h1>

          {/* Filter Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'all'
                  ? 'text-gray-700 border-b-2 border-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('reading')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'reading'
                  ? 'text-gray-700 border-b-2 border-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Reading
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'read'
                  ? 'text-gray-700 border-b-2 border-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Read
            </button>
            <button
              onClick={() => setFilter('want-to-read')}
              className={`px-4 py-2 font-medium transition-colors ${
                filter === 'want-to-read'
                  ? 'text-gray-700 border-b-2 border-gray-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Want to Read
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 mb-4">No books in this list yet</p>
            <button
              onClick={() => router.push('/search')}
              className="text-gray-700 font-semibold hover:text-gray-600 transition-colors"
            >
              Browse books to add →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="relative aspect-[2/3] bg-gray-100">
                  {book.cover_url ? (
                    <Image
                      src={book.cover_url}
                      alt={`${book.title} cover`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-700 text-sm mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                    {book.authors.join(', ')}
                  </p>

                  {/* Status dropdown */}
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.id, e.target.value as BookStatus)}
                    className="w-full text-xs px-2 py-1 border border-gray-300 rounded mb-2 text-gray-700 focus:outline-none focus:border-gray-400"
                  >
                    <option value="want-to-read">Want to Read</option>
                    <option value="reading">Reading</option>
                    <option value="read">Read</option>
                  </select>

                  <button
                    onClick={() => handleRemove(book.id)}
                    className="w-full text-xs text-red-600 hover:text-red-700 py-1 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
