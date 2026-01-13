'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import BookCard from '@/components/BookCard'
import { getUserBooks } from '@/lib/api/userBooks'
import type { UserBook, BookStatus } from '@/lib/types/userBook'
import type { Book } from '@/lib/types/book'

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

  // Convert UserBook to Book format for BookCard component
  const convertToBook = (userBook: UserBook): Book => ({
    id: userBook.book_id,
    title: userBook.title,
    authors: userBook.authors,
    publishYear: userBook.publish_year,
    coverUrl: userBook.cover_url,
    isbn: userBook.isbn,
  })

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
            {books.map((userBook) => (
              <BookCard
                key={userBook.id}
                book={convertToBook(userBook)}
                showAddButton={true}
                onBookAdded={loadBooks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
