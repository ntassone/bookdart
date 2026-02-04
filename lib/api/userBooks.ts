import { createClient } from '@/lib/supabase/client'
import type { UserBook, AddBookInput, UpdateBookInput, BookStatus, PublicReview } from '@/lib/types/userBook'

export async function getUserBooks(status?: BookStatus): Promise<UserBook[]> {
  const supabase = createClient()

  let query = supabase
    .from('user_books')
    .select('*')
    .order('date_added', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getUserBooksByUserId(userId: string, status?: BookStatus): Promise<UserBook[]> {
  const supabase = createClient()

  let query = supabase
    .from('user_books')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function addBookToLibrary(input: AddBookInput): Promise<UserBook> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if book already exists in user's library with this status
  const existingBooks = await getBookInLibrary(input.book_id)
  const existingWithStatus = existingBooks.find(b => b.status === input.status)

  if (existingWithStatus) {
    // Book already exists with this status, just return it
    return existingWithStatus
  }

  // Insert new book
  const { data, error } = await supabase
    .from('user_books')
    .insert({
      user_id: user.id,
      ...input,
      is_review_public: false,
      read_count: 1,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateUserBook(id: string, input: UpdateBookInput): Promise<UserBook> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_books')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeBookFromLibrary(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_books')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getBookInLibrary(bookId: string): Promise<UserBook[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_books')
    .select('*')
    .eq('book_id', bookId)

  if (error) throw error
  return data || []
}

/**
 * Batch fetch book statuses for multiple books in a single query
 * Returns a Record mapping book_id to UserBook arrays
 * This eliminates N+1 query problems when rendering book grids
 */
export async function getBooksInLibrary(bookIds: string[]): Promise<Record<string, UserBook[]>> {
  if (bookIds.length === 0) return {}

  const supabase = createClient()
  const { data: session } = await supabase.auth.getSession()

  if (!session?.session?.user?.id) return {}

  const { data, error } = await supabase
    .from('user_books')
    .select('*')
    .eq('user_id', session.session.user.id)
    .in('book_id', bookIds)

  if (error) throw error

  // Group results by book_id
  return (data || []).reduce((acc, book) => {
    if (!acc[book.book_id]) {
      acc[book.book_id] = []
    }
    acc[book.book_id].push(book)
    return acc
  }, {} as Record<string, UserBook[]>)
}

export async function getPublicReviewsForBook(bookId: string): Promise<PublicReview[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_books')
    .select('id, user_id, rating, notes, date_finished, read_count, created_at, updated_at')
    .eq('book_id', bookId)
    .eq('is_review_public', true)
    .eq('status', 'read')
    .not('rating', 'is', null)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getBookReviewStats(bookId: string): Promise<{
  averageRating: number | null
  totalReviews: number
}> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_books')
    .select('rating')
    .eq('book_id', bookId)
    .eq('is_review_public', true)
    .eq('status', 'read')
    .not('rating', 'is', null)

  if (error) throw error

  const reviews = data || []
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating!, 0) / totalReviews
    : null

  return { averageRating, totalReviews }
}

export async function markAsReread(id: string): Promise<UserBook> {
  const supabase = createClient()

  // First get current read_count
  const { data: current, error: fetchError } = await supabase
    .from('user_books')
    .select('read_count')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  // Increment read_count
  const { data, error } = await supabase
    .from('user_books')
    .update({
      read_count: (current.read_count || 1) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
