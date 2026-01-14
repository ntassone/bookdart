'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navigation from '@/components/Navigation'
import StarRating from '@/components/StarRating'
import ReviewCard from '@/components/ReviewCard'
import ReviewForm from '@/components/ReviewForm'
import BookCard from '@/components/BookCard'
import AddToLibraryButton from '@/components/AddToLibraryButton'
import { useAuth } from '@/lib/contexts/AuthContext'
import { updateUserBook, markAsReread } from '@/lib/api/userBooks'
import { addRecentBook } from '@/lib/utils/recentBooks'
import type { BookDetail } from '@/lib/types/bookDetail'
import type { UpdateBookInput } from '@/lib/types/userBook'

interface BookDetailClientProps {
  initialData: BookDetail
  bookId: string
}

export default function BookDetailClient({ initialData }: BookDetailClientProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [bookDetail] = useState(initialData)
  const [isEditingReview, setIsEditingReview] = useState(false)
  const { book, userBook, publicReviews, averageRating, totalReviews } = bookDetail

  // Add book to recently visited when component mounts
  useEffect(() => {
    addRecentBook(book)
  }, [book])

  const handleSaveReview = async (data: UpdateBookInput) => {
    if (!userBook) return

    await updateUserBook(userBook.id, data)
    setIsEditingReview(false)
    router.refresh() // Refresh server-side data
  }

  const handleMarkReread = async () => {
    if (!userBook) return
    if (!confirm('Mark this book as reread?')) return

    await markAsReread(userBook.id)
    router.refresh()
  }

  // Filter out current user's review from public reviews
  const otherReviews = publicReviews.filter(r => r.user_id !== user?.id)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Header - Title, Author, Year */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-700 mb-2">{book.title}</h1>
          <p className="text-xl text-gray-600 mb-1">{book.authors.join(', ')}</p>
          {book.publishYear && (
            <p className="text-lg text-gray-500">{book.publishYear}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cover and Metadata */}
          <div className="lg:col-span-1">
            {/* Book Cover Card */}
            <div className="mb-6 max-w-[200px] mx-auto">
              <BookCard
                book={book}
                showAddButton={true}
                onBookAdded={() => router.refresh()}
                onClick={() => {}}
              />
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                {/* Average Rating */}
                {totalReviews > 0 && averageRating && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Average Rating</h3>
                    <div className="flex items-center gap-2 mb-1">
                      <StarRating rating={averageRating} size="md" />
                      <span className="text-lg font-semibold text-gray-700">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                )}

                {/* ISBN if available */}
                {book.isbn && book.isbn.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">ISBN</h3>
                    <p className="text-sm text-gray-600">{book.isbn[0]}</p>
                  </div>
                )}

                {/* Add to Library or Status */}
                {!userBook ? (
                  <AddToLibraryButton
                    book={book}
                    onAdded={() => router.refresh()}
                  />
                ) : (
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Status</h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 capitalize">
                        {userBook.status.replace('-', ' ')}
                      </span>
                    </div>
                    {userBook.status === 'read' && (
                      <button
                        onClick={handleMarkReread}
                        className="w-full px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Mark as Reread
                      </button>
                    )}
                  </div>
                )}
              </div>
          </div>

          {/* Right Column - Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* User's Review Section */}
            {user && userBook && userBook.status === 'read' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Your Review</h2>

                {isEditingReview ? (
                  <ReviewForm
                    initialRating={userBook.rating}
                    initialNotes={userBook.notes}
                    initialDateFinished={userBook.date_finished}
                    initialIsPublic={userBook.is_review_public}
                    onSave={handleSaveReview}
                    onCancel={() => setIsEditingReview(false)}
                  />
                ) : (
                  <div>
                    {userBook.rating ? (
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <StarRating rating={userBook.rating} size="md" />
                          {userBook.is_review_public && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Public
                            </span>
                          )}
                        </div>
                        {userBook.date_finished && (
                          <p className="text-sm text-gray-500">
                            Finished: {new Date(userBook.date_finished).toLocaleDateString()}
                          </p>
                        )}
                        {userBook.notes && (
                          <p className="text-gray-700 whitespace-pre-wrap">{userBook.notes}</p>
                        )}
                        {userBook.read_count > 1 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Reread {userBook.read_count}x
                          </span>
                        )}
                        <button
                          onClick={() => setIsEditingReview(true)}
                          className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                        >
                          Edit Review
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500 mb-4">You haven&apos;t reviewed this book yet.</p>
                        <button
                          onClick={() => setIsEditingReview(true)}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                        >
                          Write a Review
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Public Reviews */}
            <div>
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                Community Reviews {otherReviews.length > 0 && `(${otherReviews.length})`}
              </h2>

              {otherReviews.length > 0 ? (
                <div className="space-y-4">
                  {otherReviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <p className="text-gray-500">No public reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
