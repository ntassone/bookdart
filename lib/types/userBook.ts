export type BookStatus = 'reading' | 'read' | 'want-to-read'

export interface UserBook {
  id: string
  user_id: string
  book_id: string
  status: BookStatus
  rating?: number
  notes?: string
  date_added: string
  date_finished?: string
  is_review_public: boolean
  read_count: number

  // Book metadata
  title: string
  authors: string[]
  publish_year?: number
  cover_url?: string
  isbn?: string[]

  created_at: string
  updated_at: string
}

export interface AddBookInput {
  book_id: string
  status: BookStatus
  title: string
  authors: string[]
  publish_year?: number
  cover_url?: string
  isbn?: string[]
}

export interface UpdateBookInput {
  status?: BookStatus
  rating?: number
  notes?: string
  date_finished?: string
  is_review_public?: boolean
  read_count?: number
}

export interface PublicReview {
  id: string
  user_id: string
  rating: number
  notes?: string
  date_finished?: string
  read_count: number
  created_at: string
  updated_at: string
}
