import { notFound } from 'next/navigation'
import BookDetailClient from './BookDetailClient'
import { getBookDetailData } from '@/lib/api/bookDetails'

interface BookDetailPageProps {
  params: Promise<{ id: string }>
}

/**
 * Server component for book detail page
 * Fetches data on server side for SEO and performance
 */
export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { id } = await params

  // Decode the book ID (comes URL encoded as "works-OL12345W")
  // Convert back to Open Library format "/works/OL12345W"
  const bookId = `/works/${id.replace('works-', '')}`

  const bookDetail = await getBookDetailData(bookId)

  if (!bookDetail) {
    notFound()
  }

  return <BookDetailClient initialData={bookDetail} bookId={bookId} />
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BookDetailPageProps) {
  const { id } = await params
  const bookId = `/works/${id.replace('works-', '')}`
  const bookDetail = await getBookDetailData(bookId)

  if (!bookDetail) {
    return {
      title: 'Book Not Found - Bookdart',
    }
  }

  return {
    title: `${bookDetail.book.title} - Bookdart`,
    description: `Read reviews and track ${bookDetail.book.title} by ${bookDetail.book.authors.join(', ')} on Bookdart`,
  }
}
