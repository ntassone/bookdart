import { createClient } from '@/lib/supabase/client'
import type { UserBook, AddBookInput, UpdateBookInput, BookStatus } from '@/lib/types/userBook'

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

export async function addBookToLibrary(input: AddBookInput): Promise<UserBook> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('user_books')
    .insert({
      user_id: user.id,
      ...input,
    })
    .select()
    .single()

  if (error) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new Error('Book already in your library')
    }
    throw error
  }

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

export async function getBookInLibrary(bookId: string): Promise<UserBook | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_books')
    .select('*')
    .eq('book_id', bookId)
    .maybeSingle()

  if (error) throw error
  return data
}
