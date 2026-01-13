import type { Book } from './book'
import type { UserBook, PublicReview } from './userBook'

export interface BookDetail {
  book: Book
  userBook?: UserBook
  publicReviews: PublicReview[]
  averageRating?: number
  totalReviews: number
}

// Open Library Works API response types
export interface OpenLibraryWork {
  key: string
  title: string
  authors?: Array<{
    author: { key: string }
    type: { key: string }
  }>
  description?: string | { value: string }
  subjects?: string[]
  first_publish_date?: string
  covers?: number[]
}

export interface OpenLibraryEditionsResponse {
  entries: Array<{
    covers?: number[]
    isbn?: string[]
    publish_date?: string
  }>
}

export interface OpenLibraryAuthor {
  name: string
}
