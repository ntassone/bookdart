'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useToast } from '@/lib/contexts/ToastContext'
import Navigation from '@/components/Navigation'
import BookCard from '@/components/BookCard'
import FavoriteBooksEditor from '@/components/FavoriteBooksEditor'
import CurrentlyReadingSection from '@/components/CurrentlyReadingSection'
import AddFavoriteModal from '@/components/AddFavoriteModal'
import LoadingIndicator from '@/components/LoadingIndicator'
import { useProfileByUsername, useCurrentUserProfile, useUserBooks, useCachedBooks, useAddToFavorites, useRemoveFromFavorites, useReorderFavorites } from '@/lib/hooks/useProfileData'
import type { BookStatus } from '@/lib/types/userBook'
import type { Book } from '@/lib/types/book'

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [filter, setFilter] = useState<BookStatus | 'all'>('all')
  const [showAddFavoriteModal, setShowAddFavoriteModal] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  // Fetch profile data using React Query
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(params.username)
  const { data: currentUserProfile } = useCurrentUserProfile()

  // Fetch books only if viewing own profile
  const { data: books = [], isLoading: booksLoading, refetch: refetchBooks } = useUserBooks(
    isOwnProfile ? (filter === 'all' ? undefined : filter) : undefined
  )

  // Fetch favorite books using cache
  const favoriteBookIds = profile?.favorite_books || []
  const { data: favoriteBooks = [], isLoading: favoritesLoading } = useCachedBooks(favoriteBookIds)

  // Mutations for favorites
  const addToFavoritesMutation = useAddToFavorites()
  const removeFromFavoritesMutation = useRemoveFromFavorites()
  const reorderFavoritesMutation = useReorderFavorites()

  // Check if viewing own profile
  useEffect(() => {
    if (!authLoading && currentUserProfile) {
      setIsOwnProfile(currentUserProfile.username === params.username)
    } else {
      setIsOwnProfile(false)
    }
  }, [currentUserProfile, params.username, authLoading])

  // Convert UserBook to Book format
  const convertToBook = (userBook: typeof books[number]): Book => ({
    id: userBook.book_id,
    title: userBook.title,
    authors: userBook.authors,
    publishYear: userBook.publish_year,
    coverUrl: userBook.cover_url,
    isbn: userBook.isbn,
  })

  // Extract currently reading books
  const currentlyReading = useMemo(() => {
    if (!isOwnProfile || !books) return []
    return books
      .filter(b => b.status === 'reading')
      .map(convertToBook)
  }, [books, isOwnProfile])

  const handleAddFavorite = async (book: Book) => {
    if (!isOwnProfile) return

    try {
      await addToFavoritesMutation.mutateAsync(book.id)
      addToast('Added to favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add favorite', 'error')
    }
  }

  const handleRemoveFavorite = async (bookId: string) => {
    if (!isOwnProfile) return

    try {
      await removeFromFavoritesMutation.mutateAsync(bookId)
      addToast('Removed from favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to remove favorite', 'error')
    }
  }

  const handleReorderFavorites = async (bookIds: string[]) => {
    if (!isOwnProfile) return

    try {
      await reorderFavoritesMutation.mutateAsync(bookIds)
    } catch (error) {
      console.error('Failed to reorder favorites:', error)
    }
  }

  // Get filtered books for the list section (exclude currently reading from the main list)
  const filteredBooks = useMemo(() => {
    if (filter === 'all') {
      return books.filter(b => b.status !== 'reading')
    }
    return books
  }, [books, filter])

  // Combined loading state
  const loading = profileLoading || authLoading

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
            <h1 className="text-2xl font-bold text-warm-text mb-2">User not found</h1>
            <p className="text-warm-text-secondary mb-4">No user with username @{params.username}</p>
            <button
              onClick={() => router.push('/')}
              className="text-warm-text font-semibold hover:text-warm-text-secondary transition-colors"
            >
              Go home →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-warm-bg-secondary">
      <Navigation />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Profile Header Section */}
        <div className="grid grid-cols-12 gap-6 mb-12">
          {/* Left: Reading Now - Large Book Cover */}
          <div className="col-span-3">
            <CurrentlyReadingSection
              books={currentlyReading}
              onBookAdded={refetchBooks}
              showLarge={true}
              editable={isOwnProfile}
            />
          </div>

          {/* Center: Profile Info */}
          <div className="col-span-5 flex flex-col">
            {/* Avatar and Profile Info */}
            <div className="flex items-start gap-4 mb-auto">
              {/* Avatar */}
              <div className="w-24 h-24 bg-warm-border overflow-hidden flex-shrink-0">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt={profile.username || 'User'} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-warm-text-secondary text-3xl font-bold">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Name, Username, Location */}
              <div className="flex-1 pt-1">
                <h1 className="text-2xl font-bold text-warm-text mb-2">
                  {user?.user_metadata?.full_name || 'Nick Tassone'}
                </h1>
                <div className="flex items-center gap-3 text-sm text-warm-text-secondary mb-2">
                  <span>@{profile.username}</span>
                  <span>Hamilton, ON</span>
                </div>
                <a href="#" className="text-sm text-warm-text-secondary hover:underline">32 Followers</a>
              </div>
            </div>

            {/* Stats Boxes at Bottom */}
            <div className="grid grid-cols-3 gap-4 mt-auto">
              <div className="bg-warm-bg p-6 text-center border border-warm-border">
                <div className="text-3xl font-bold text-warm-text mb-1">2,345</div>
                <div className="text-xs text-warm-text-secondary uppercase tracking-wide">BOOKS READ</div>
              </div>
              <div className="bg-warm-bg p-6 text-center border border-warm-border">
                <div className="text-3xl font-bold text-warm-text mb-1">1,299</div>
                <div className="text-xs text-warm-text-secondary uppercase tracking-wide">READ LIST</div>
              </div>
              <div className="bg-warm-bg p-6 text-center border border-warm-border">
                <div className="text-3xl font-bold text-warm-text mb-1">120</div>
                <div className="text-xs text-warm-text-secondary uppercase tracking-wide">REVIEWS</div>
              </div>
            </div>
          </div>

          {/* Right: Favorite Books and Follow Button */}
          <div className="col-span-4 relative">
            {/* Follow Button - Top Right */}
            {!isOwnProfile && (
              <div className="absolute top-0 right-0 flex gap-2">
                <button className="px-6 py-2 bg-warm-text text-warm-bg-secondary font-semibold hover:bg-warm-text-secondary transition-colors text-sm tracking-wide">
                  FOLLOW
                </button>
                <button className="p-2 border border-warm-border hover:bg-warm-bg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            )}

            <FavoriteBooksEditor
              favoriteBooks={favoriteBooks}
              onReorder={isOwnProfile ? handleReorderFavorites : undefined}
              onRemove={isOwnProfile ? handleRemoveFavorite : undefined}
              onAddClick={isOwnProfile ? () => setShowAddFavoriteModal(true) : undefined}
              onBookAdded={refetchBooks}
              showActions={!isOwnProfile}
            />
          </div>
        </div>

        <div className="space-y-8">

          {/* Book Lists - Only show on own profile for now */}
          {isOwnProfile && (
            <div className="border border-warm-border p-6 bg-warm-bg-secondary">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-warm-text mb-4">My Lists</h2>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-warm-border">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      filter === 'all'
                        ? 'text-warm-text border-b-2 border-warm-text'
                        : 'text-warm-text-tertiary hover:text-warm-text'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('read')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      filter === 'read'
                        ? 'text-warm-text border-b-2 border-warm-text'
                        : 'text-warm-text-tertiary hover:text-warm-text'
                    }`}
                  >
                    Read
                  </button>
                  <button
                    onClick={() => setFilter('want-to-read')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      filter === 'want-to-read'
                        ? 'text-warm-text border-b-2 border-warm-text'
                        : 'text-warm-text-tertiary hover:text-warm-text'
                    }`}
                  >
                    Want to Read
                  </button>
                </div>
              </div>

              {filteredBooks.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-warm-text-secondary mb-4">No books in this list yet</p>
                  <button
                    onClick={() => router.push('/search')}
                    className="text-warm-text font-semibold hover:text-warm-text-secondary transition-colors"
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
                      onBookAdded={refetchBooks}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message for viewing other profiles - temporary */}
          {!isOwnProfile && (
            <div className="border border-warm-border p-6 bg-warm-bg-secondary text-center py-12">
              <p className="text-warm-text-secondary">
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
