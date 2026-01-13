import { notFound } from 'next/navigation'
import BookDetailClient from './BookDetailClient'
import { getBookDetailData } from '@/lib/api/bookDetails'
import { extractBookIdFromSlug, bookIdToKey } from '@/lib/utils/bookUrl'
import { Metadata } from 'next'

interface BookDetailPageProps {
  params: Promise<{ author: string; slug: string }>
}

/**
 * Server component for book detail page
 * Fetches data on server side for SEO and performance
 */
export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params

  // Extract the Open Library ID from the slug
  // Example: "harry-potter-and-the-sorcerers-stone-OL26331930M" -> "OL26331930M"
  const bookId = extractBookIdFromSlug(slug)
  const bookKey = bookIdToKey(bookId)

  const bookDetail = await getBookDetailData(bookKey)

  if (!bookDetail) {
    notFound()
  }

  return <BookDetailClient initialData={bookDetail} bookId={bookKey} />
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const bookId = extractBookIdFromSlug(slug)
  const bookKey = bookIdToKey(bookId)
  const bookDetail = await getBookDetailData(bookKey)

  if (!bookDetail) {
    return {
      title: 'Book Not Found - Bookdart',
    }
  }

  const { book } = bookDetail

  return {
    title: `${book.title} by ${book.authors.join(', ')} - Bookdart`,
    description: `Read reviews and track ${book.title} by ${book.authors.join(', ')} on Bookdart. ${
      bookDetail.totalReviews > 0
        ? `Average rating: ${bookDetail.averageRating?.toFixed(1)} from ${bookDetail.totalReviews} reviews.`
        : 'Be the first to review!'
    }`,
  }
}
