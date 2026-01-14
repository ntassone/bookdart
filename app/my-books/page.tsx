'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/contexts/ToastContext'
import Navigation from '@/components/Navigation'
import BookCard from '@/components/BookCard'
import FavoriteBooksEditor from '@/components/FavoriteBooksEditor'
import CurrentlyReadingSection from '@/components/CurrentlyReadingSection'
import AddFavoriteModal from '@/components/AddFavoriteModal'
import { getUserBooks } from '@/lib/api/userBooks'
import { getUserProfile, addToFavorites, removeFromFavorites, reorderFavorites } from '@/lib/api/userProfile'
import { getCachedBooks } from '@/lib/api/bookCache'
import type { UserBook, BookStatus } from '@/lib/types/userBook'
import type { Book } from '@/lib/types/book'
import type { UserProfile } from '@/lib/types/userProfile'

export default function MyBooksPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [books, setBooks] = useState<UserBook[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<BookStatus | 'all'>('all')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([])
  const [currentlyReading, setCurrentlyReading] = useState<Book[]>([])
  const [showAddFavoriteModal, setShowAddFavoriteModal] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, filter])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load user profile and books in parallel
      const [profileData, booksData] = await Promise.all([
        getUserProfile(),
        getUserBooks(filter === 'all' ? undefined : filter)
      ])

      setProfile(profileData)
      setBooks(booksData)

      // Load favorite books from cache
      if (profileData && profileData.favorite_books.length > 0) {
        const cachedBooks = await getCachedBooks(profileData.favorite_books)
        const favorites = profileData.favorite_books
          .map(id => cachedBooks.get(id))
          .filter((book): book is Book => book !== undefined)
        setFavoriteBooks(favorites)
      } else {
        setFavoriteBooks([])
      }

      // Extract currently reading books
      const readingBooks = booksData
        .filter(b => b.status === 'reading')
        .map(convertToBook)
      setCurrentlyReading(readingBooks)

    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFavorite = async (book: Book) => {
    try {
      await addToFavorites(book.id)
      await loadData()
      addToast('Added to favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add favorite', 'error')
    }
  }

  const handleRemoveFavorite = async (bookId: string) => {
    try {
      await removeFromFavorites(bookId)
      await loadData()
      addToast('Removed from favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to remove favorite', 'error')
    }
  }

  const handleReorderFavorites = async (bookIds: string[]) => {
    try {
      await reorderFavorites(bookIds)
      // Optimistically update UI
      const cachedBooks = await getCachedBooks(bookIds)
      const reordered = bookIds
        .map(id => cachedBooks.get(id))
        .filter((book): book is Book => book !== undefined)
      setFavoriteBooks(reordered)
    } catch (error) {
      console.error('Failed to reorder favorites:', error)
      await loadData() // Reload on error
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
          <div className="animate-spin h-12 w-12 border-b-2 border-gray-600"></div>
        </div>
      </div>
    )
  }

  // Get filtered books for the list section (exclude currently reading from the main list)
  const filteredBooks = filter === 'all'
    ? books.filter(b => b.status !== 'reading')
    : books

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-700 mb-2">My Books</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-12 w-12 border-b-2 border-gray-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Favorite Books Billboard */}
            <FavoriteBooksEditor
              favoriteBooks={favoriteBooks}
              onReorder={handleReorderFavorites}
              onRemove={handleRemoveFavorite}
              onAddClick={() => setShowAddFavoriteModal(true)}
            />

            {/* Currently Reading */}
            {currentlyReading.length > 0 && (
              <CurrentlyReadingSection
                books={currentlyReading}
                onBookAdded={loadData}
              />
            )}

            {/* Book Lists */}
            <div className="border border-gray-200 p-6 bg-white">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">My Lists</h2>

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

              {filteredBooks.length === 0 ? (
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredBooks.map((userBook) => (
                    <BookCard
                      key={userBook.id}
                      book={convertToBook(userBook)}
                      showAddButton={true}
                      onBookAdded={loadData}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Favorite Modal */}
      <AddFavoriteModal
        open={showAddFavoriteModal}
        onClose={() => setShowAddFavoriteModal(false)}
        onSelect={handleAddFavorite}
        currentFavorites={profile?.favorite_books || []}
      />
    </div>
  )
}
