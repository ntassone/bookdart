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
import LoadingIndicator from '@/components/LoadingIndicator'
import { getUserBooks } from '@/lib/api/userBooks'
import { getUserProfile, getUserProfileByUsername, addToFavorites, removeFromFavorites, reorderFavorites } from '@/lib/api/userProfile'
import { getCachedBooks } from '@/lib/api/bookCache'
import type { UserBook, BookStatus } from '@/lib/types/userBook'
import type { Book } from '@/lib/types/book'
import type { UserProfile } from '@/lib/types/userProfile'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
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
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  // Check if viewing own profile
  useEffect(() => {
    const checkProfileOwnership = async () => {
      if (!user) {
        setIsOwnProfile(false)
        return
      }

      const currentProfile = await getUserProfile()

      if (currentProfile && currentProfile.username === params.username) {
        setIsOwnProfile(true)
      } else {
        setIsOwnProfile(false)
      }
    }

    if (!authLoading) {
      checkProfileOwnership()
    }
  }, [user, authLoading, params.username])

  // Load profile data
  useEffect(() => {
    loadData()
  }, [params.username, filter, isOwnProfile])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load profile by username
      const profileData = await getUserProfileByUsername(params.username)

      if (!profileData) {
        setLoading(false)
        return
      }

      setProfile(profileData)

      // Load books for this user
      // Note: This will need to be updated to support fetching other users' books
      // For now, it only works for own profile
      if (isOwnProfile) {
        const booksData = await getUserBooks(filter === 'all' ? undefined : filter)
        setBooks(booksData)

        // Extract currently reading books
        const readingBooks = booksData
          .filter(b => b.status === 'reading')
          .map(convertToBook)
        setCurrentlyReading(readingBooks)
      } else {
        // Clear books when viewing someone else's profile
        setBooks([])
        setCurrentlyReading([])
      }

      // Load favorite books from cache
      if (profileData.favorite_books.length > 0) {
        const cachedBooks = await getCachedBooks(profileData.favorite_books)
        const favorites = profileData.favorite_books
          .map(id => cachedBooks.get(id))
          .filter((book): book is Book => book !== undefined)
        setFavoriteBooks(favorites)
      } else {
        setFavoriteBooks([])
      }

    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddFavorite = async (book: Book) => {
    if (!isOwnProfile) return

    try {
      await addToFavorites(book.id)
      await loadData()
      addToast('Added to favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add favorite', 'error')
    }
  }

  const handleRemoveFavorite = async (bookId: string) => {
    if (!isOwnProfile) return

    try {
      await removeFromFavorites(bookId)
      await loadData()
      addToast('Removed from favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to remove favorite', 'error')
    }
  }

  const handleReorderFavorites = async (bookIds: string[]) => {
    if (!isOwnProfile) return

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

  // Get filtered books for the list section (exclude currently reading from the main list)
  const filteredBooks = filter === 'all'
    ? books.filter(b => b.status !== 'reading')
    : books

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <LoadingIndicator size="lg" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-2">User not found</h1>
            <p className="text-gray-600 mb-4">No user with username @{params.username}</p>
            <button
              onClick={() => router.push('/')}
              className="text-gray-700 font-semibold hover:text-gray-600 transition-colors"
            >
              Go home →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-700 mb-2">
            @{profile.username}
          </h1>
        </div>

        <div className="space-y-8">
          {/* Single row layout: Reading Now + Favorites */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-24">
            {/* Reading Now */}
            <div className="lg:col-span-1">
              <CurrentlyReadingSection
                books={currentlyReading}
                onBookAdded={loadData}
              />
            </div>

            {/* Favorite Books - 4 books in the remaining space */}
            <div className="lg:col-span-3">
              <FavoriteBooksEditor
                favoriteBooks={favoriteBooks}
                onReorder={isOwnProfile ? handleReorderFavorites : undefined}
                onRemove={isOwnProfile ? handleRemoveFavorite : undefined}
                onAddClick={isOwnProfile ? () => setShowAddFavoriteModal(true) : undefined}
                onBookAdded={loadData}
                showActions={!isOwnProfile}
              />
            </div>
          </div>

          {/* Book Lists - Only show on own profile for now */}
          {isOwnProfile && (
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
          )}

          {/* Message for viewing other profiles - temporary */}
          {!isOwnProfile && (
            <div className="border border-gray-200 p-6 bg-white text-center py-12">
              <p className="text-gray-600">
                Public profile viewing coming soon
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Favorite Modal - Only for own profile */}
      {isOwnProfile && (
        <AddFavoriteModal
          open={showAddFavoriteModal}
          onClose={() => setShowAddFavoriteModal(false)}
          onSelect={handleAddFavorite}
          currentFavorites={profile?.favorite_books || []}
        />
      )}
    </div>
  )
}
