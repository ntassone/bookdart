import type { Book } from './book'

export interface UserProfile {
  id: string
  user_id: string
  favorite_books: string[]
  fade_completed_books: boolean
  recent_searches: string[]
  recent_books: Book[]
  created_at: string
  updated_at: string
}

export interface UpdateProfileInput {
  favorite_books?: string[]
  fade_completed_books?: boolean
  recent_searches?: string[]
  recent_books?: Book[]
}
