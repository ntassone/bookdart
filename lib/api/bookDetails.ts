import type { BookDetail } from '@/lib/types/bookDetail'
import { getBookDetails } from './openLibraryDetails'
import { getBookInLibrary, getPublicReviewsForBook, getBookReviewStats } from './userBooks'

/**
 * Fetch complete book detail page data
 * Combines book metadata, user's personal entry, and public reviews
 */
export async function getBookDetailData(bookId: string): Promise<BookDetail | null> {
  try {
    // Fetch in parallel for performance
    const [book, userBook, publicReviews, stats] = await Promise.all([
      getBookDetails(bookId),
      getBookInLibrary(bookId).catch(() => null), // User may not be authenticated
      getPublicReviewsForBook(bookId),
      getBookReviewStats(bookId),
    ])

    if (!book) return null

    return {
      book,
      userBook: userBook || undefined,
      publicReviews,
      averageRating: stats.averageRating || undefined,
      totalReviews: stats.totalReviews,
    }
  } catch (error) {
    console.error('Error fetching book detail data:', error)
    return null
  }
}
