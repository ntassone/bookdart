'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { MoreVertical } from 'lucide-react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/lib/contexts/ToastContext'
import Navigation from '@/components/Navigation'
import BookCard from '@/components/BookCard'
import FavoriteBooksEditor from '@/components/FavoriteBooksEditor'
import CurrentlyReadingSection from '@/components/CurrentlyReadingSection'
import AddFavoriteModal from '@/components/AddFavoriteModal'
import LoadingIndicator from '@/components/LoadingIndicator'
import BookSearchPanel from '@/components/BookSearchPanel'
import { useProfileByUsername, useCurrentUserProfile, useUserBooks, useUserBooksByUserId, useCachedBooks, useAddToFavorites, useRemoveFromFavorites, useReorderFavorites } from '@/lib/hooks/useProfileData'
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
  const [currentlyReadingCleared, setCurrentlyReadingCleared] = useState(false)
  const [isSearchingBook, setIsSearchingBook] = useState(false)

  // Fetch profile data using React Query
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(params.username)
  const { data: currentUserProfile } = useCurrentUserProfile()

  // Fetch own books (for own profile) - filtered for display
  const { data: ownBooks = [], isLoading: ownBooksLoading, refetch: refetchBooks } = useUserBooks(
    isOwnProfile ? (filter === 'all' ? undefined : filter) : undefined
  )

  // Fetch ALL own books (unfiltered) for stats calculation
  const { data: allOwnBooks = [] } = useUserBooks(isOwnProfile ? undefined : undefined)

  // Fetch other user's books (for viewing other profiles) - filtered for display
  const { data: otherUserBooks = [], isLoading: otherBooksLoading } = useUserBooksByUserId(
    !isOwnProfile ? profile?.user_id : undefined,
    filter === 'all' ? undefined : filter
  )

  // Fetch ALL other user's books (unfiltered) for stats calculation
  const { data: allOtherUserBooks = [] } = useUserBooksByUserId(
    !isOwnProfile ? profile?.user_id : undefined,
    undefined
  )

  // Use the appropriate books based on whether viewing own profile
  const books = isOwnProfile ? ownBooks : otherUserBooks
  const allBooks = isOwnProfile ? allOwnBooks : allOtherUserBooks
  const booksLoading = isOwnProfile ? ownBooksLoading : otherBooksLoading

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
  const convertToBook = useCallback((userBook: typeof books[number]): Book => ({
    id: userBook.book_id,
    title: userBook.title,
    authors: userBook.authors,
    publishYear: userBook.publish_year,
    coverUrl: userBook.cover_url,
    isbn: userBook.isbn,
  }), [])

  // Extract currently reading books - only show the most recently updated one
  const currentlyReading = useMemo(() => {
    if (!isOwnProfile || !books || currentlyReadingCleared) return []
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const readingBooks = books
      .filter(b => b.status === 'reading')
      .filter(b => new Date(b.updated_at) > thirtyDaysAgo) // Only show books updated in last 30 days
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 1) // Only take the most recently updated reading book
      .map(convertToBook)
    return readingBooks
  }, [books, isOwnProfile, currentlyReadingCleared, convertToBook])

  // Calculate profile stats from ALL books (unfiltered)
  const stats = useMemo(() => {
    const booksRead = allBooks.filter(b => b.status === 'read').length
    const wantToRead = allBooks.filter(b => b.status === 'want-to-read').length
    const reviews = allBooks.filter(b => b.status === 'read' && b.rating != null).length
    return { booksRead, wantToRead, reviews }
  }, [allBooks])

  // Track previous reading count to detect when NEW reading books are added
  const previousReadingCountRef = useRef(0)

  // Reset cleared flag only when a NEW book is added to reading (count increases)
  useEffect(() => {
    const currentReadingCount = books.filter(b => b.status === 'reading').length

    // Only reset if count increased (new book added)
    if (currentReadingCount > previousReadingCountRef.current && currentlyReadingCleared) {
      setCurrentlyReadingCleared(false)
    }

    previousReadingCountRef.current = currentReadingCount
  }, [books, currentlyReadingCleared])

  const handleAddFavorite = useCallback(async (book: Book) => {
    if (!isOwnProfile) return

    try {
      await addToFavoritesMutation.mutateAsync(book.id)
      addToast('Added to favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to add favorite', 'error')
    }
  }, [isOwnProfile, addToFavoritesMutation, addToast])

  const handleRemoveFavorite = useCallback(async (bookId: string) => {
    if (!isOwnProfile) return

    try {
      await removeFromFavoritesMutation.mutateAsync(bookId)
      addToast('Removed from favorites', 'success')
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to remove favorite', 'error')
    }
  }, [isOwnProfile, removeFromFavoritesMutation, addToast])

  const handleReorderFavorites = useCallback(async (bookIds: string[]) => {
    if (!isOwnProfile) return

    try {
      await reorderFavoritesMutation.mutateAsync(bookIds)
    } catch (error) {
      console.error('Failed to reorder favorites:', error)
    }
  }, [isOwnProfile, reorderFavoritesMutation])

  const handleCurrentlyReadingCleared = useCallback(() => {
    setCurrentlyReadingCleared(true)
  }, [])

  // Get filtered books for the list section (exclude currently reading from the main list)
  const filteredBooks = useMemo(() => {
    if (filter === 'all') {
      return books.filter(b => b.status !== 'reading')
    }
    return books
  }, [books, filter])

  // Create bookStatuses record for batch optimization
  const bookStatuses = useMemo(() => {
    return books.reduce((acc, userBook) => {
      if (!acc[userBook.book_id]) {
        acc[userBook.book_id] = []
      }
      acc[userBook.book_id].push(userBook)
      return acc
    }, {} as Record<string, typeof books>)
  }, [books])

  // Combined loading state
  const loading = profileLoading || authLoading

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center flex-1">
          <LoadingIndicator size="lg" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-warm-text">User not found</h1>
            <p className="mb-4 text-warm-text-secondary">No user with username @{params.username}</p>
            <button
              onClick={() => router.push('/')}
              className="font-semibold transition-colors text-warm-text hover:text-warm-text-secondary"
            >
              Go home →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-warm-bg-secondary">
      <Navigation />

      <div className="flex-1 w-full px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Profile Header Section */}
        <div className={`grid p-2 mb-12 border border-warm-border bg-warm-bg-secondary shadow-[0_5px_0_0] shadow-warm-bg ${isSearchingBook ? 'gap-2' : 'gap-8'}`} style={{ gridTemplateColumns: '280px 1fr' }}>
          {/* Left: Reading Now - Large Book Cover */}
          <div className="h-full min-w-0">
            <CurrentlyReadingSection
              books={currentlyReading}
              onBookAdded={refetchBooks}
              onBookRemoved={handleCurrentlyReadingCleared}
              showLarge={true}
              editable={isOwnProfile}
              bookStatuses={bookStatuses}
              onSearchModeChange={setIsSearchingBook}
              isSearchMode={isSearchingBook}
            />
          </div>

          {/* Right: Profile Info, Stats, and Favorites OR Book Search */}
          {isSearchingBook ? (
            <div className="flex flex-col h-full min-w-0 overflow-hidden">
              <BookSearchPanel
                onClose={() => setIsSearchingBook(false)}
                onBookSelected={refetchBooks}
              />
            </div>
          ) : (
          <div className="flex flex-col h-full min-w-0 gap-8 p-6 overflow-hidden">
            {/* Row 1: Profile Info */}
            <div className="flex items-start gap-8">
              {/* Avatar */}
              <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-s-sm bg-warm-border">
                {user?.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt={profile.username || 'User'} className="object-cover w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-3xl font-bold text-warm-text-secondary">
                    {profile.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              {/* Name, Username, Location */}
              <div className="flex-1 pt-1">
                <h1 className="mb-2 text-2xl font-semibold text-warm-text">
                  {user?.user_metadata?.full_name || 'Nick Tassone'}
                </h1>
                <div className="flex items-center gap-3 text-sm text-warm-text-secondary">
                  <span>@{profile.username}</span>
                  <span>Hamilton, ON</span>
                  <a href="#" className="hover:underline">32 Followers</a>
                </div>
              </div>

              {/* Follow buttons - only for other profiles */}
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <button className="px-6 py-2 text-sm font-semibold tracking-wide transition-colors bg-warm-text text-warm-bg-secondary hover:bg-warm-text-secondary">
                    FOLLOW
                  </button>
                  <button className="p-2 transition-colors border border-warm-border hover:bg-warm-bg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: Stats and Favorites */}
            <div className="flex min-w-0 gap-12">
              {/* Stats Box - Grows to fill space */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col">
                  <Link
                    href={`/${params.username}?filter=read`}
                    className="flex items-center justify-between p-3 transition-colors border-b border-warm-border hover:bg-warm-bg-secondary/30"
                  >
                    <div className="text-xl font-regular text-warm-text">{stats.booksRead.toLocaleString()}</div>
                    <div className="text-xs tracking-wide uppercase text-warm-text-tertiary">Books read</div>
                  </Link>
                  <Link
                    href={`/${params.username}?filter=want-to-read`}
                    className="flex items-center justify-between p-3 transition-colors border-b border-warm-border hover:bg-warm-bg-secondary/30"
                  >
                    <div className="text-xl font-regular text-warm-text">{stats.wantToRead.toLocaleString()}</div>
                    <div className="text-xs tracking-wide uppercase text-warm-text-tertiary">Read list</div>
                  </Link>
                  <Link
                    href={`/${params.username}#reviews`}
                    className="flex items-center justify-between p-3 transition-colors hover:bg-warm-bg-secondary/30"
                  >
                    <div className="text-xl font-regular text-warm-text">{stats.reviews.toLocaleString()}</div>
                    <div className="text-xs tracking-wide uppercase text-warm-text-tertiary">Reviews</div>
                  </Link>
                </div>
              </div>

              {/* Favorite Books */}
              <div className="flex-shrink-0">
                <FavoriteBooksEditor
                  favoriteBooks={favoriteBooks}
                  onReorder={isOwnProfile ? handleReorderFavorites : undefined}
                  onRemove={isOwnProfile ? handleRemoveFavorite : undefined}
                  onAddClick={isOwnProfile ? () => setShowAddFavoriteModal(true) : undefined}
                  onBookAdded={refetchBooks}
                  showActions={!isOwnProfile}
                  bookStatuses={bookStatuses}
                />
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="space-y-8">

          {/* Book Lists - Only show on own profile for now */}
          {isOwnProfile && (
            <div className="p-6 border border-warm-border bg-warm-bg-secondary">
              <div className="mb-6">
                <h2 className="mb-4 text-xl font-bold text-warm-text">My Lists</h2>

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
                <div className="py-20 text-center">
                  <p className="mb-4 text-warm-text-secondary">No books in this list yet</p>
                  <button
                    onClick={() => router.push('/search')}
                    className="font-semibold transition-colors text-warm-text hover:text-warm-text-secondary"
                  >
                    Browse books to add →
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {filteredBooks.map((userBook) => (
                    <BookCard
                      key={userBook.id}
                      book={convertToBook(userBook)}
                      showAddButton={true}
                      onBookAdded={refetchBooks}
                      initialBookStatus={bookStatuses[userBook.book_id]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Message for viewing other profiles - temporary */}
          {!isOwnProfile && (
            <div className="p-6 py-12 text-center border border-warm-border bg-warm-bg-secondary">
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
