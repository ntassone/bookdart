import { createClient } from '@/lib/supabase/client'
import type { Book, CachedBook } from '@/lib/types/book'

// Cache expiration time: 30 days
const CACHE_EXPIRATION_DAYS = 30

/**
 * Get a book from the cache by ID
 */
export async function getCachedBook(bookId: string): Promise<Book | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('book_cache')
    .select('*')
    .eq('id', bookId)
    .single()

  if (error || !data) {
    return null
  }

  // Check if cache is expired
  const cachedAt = new Date(data.cached_at)
  const now = new Date()
  const daysSinceCached = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSinceCached > CACHE_EXPIRATION_DAYS) {
    return null // Cache expired
  }

  // Convert database format to Book interface
  return {
    id: data.id,
    title: data.title,
    authors: data.authors,
    publishYear: data.publish_year,
    coverUrl: data.cover_url,
    isbn: data.isbn,
  }
}

/**
 * Get multiple books from the cache by IDs
 */
export async function getCachedBooks(bookIds: string[]): Promise<Map<string, Book>> {
  const supabase = createClient()
  const results = new Map<string, Book>()

  if (bookIds.length === 0) {
    return results
  }

  const { data, error } = await supabase
    .from('book_cache')
    .select('*')
    .in('id', bookIds)

  if (error || !data) {
    return results
  }

  const now = new Date()

  // Filter out expired cache entries and convert to Book objects
  data.forEach((cached) => {
    const cachedAt = new Date(cached.cached_at)
    const daysSinceCached = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60 * 24)

    if (daysSinceCached <= CACHE_EXPIRATION_DAYS) {
      results.set(cached.id, {
        id: cached.id,
        title: cached.title,
        authors: cached.authors,
        publishYear: cached.publish_year,
        coverUrl: cached.cover_url,
        isbn: cached.isbn,
      })
    }
  })

  return results
}

/**
 * Save a book to the cache
 */
export async function cacheBook(book: Book): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('book_cache')
    .upsert({
      id: book.id,
      title: book.title,
      authors: book.authors,
      publish_year: book.publishYear,
      cover_url: book.coverUrl,
      isbn: book.isbn,
      cached_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error caching book:', error)
  }
}

/**
 * Save multiple books to the cache
 */
export async function cacheBooks(books: Book[]): Promise<void> {
  const supabase = createClient()

  if (books.length === 0) {
    return
  }

  const now = new Date().toISOString()

  const cacheEntries = books.map((book) => ({
    id: book.id,
    title: book.title,
    authors: book.authors,
    publish_year: book.publishYear,
    cover_url: book.coverUrl,
    isbn: book.isbn,
    cached_at: now,
  }))

  const { error } = await supabase.from('book_cache').upsert(cacheEntries)

  if (error) {
    console.error('Error caching books:', error)
  }
}

/**
 * Clear expired cache entries (run periodically)
 */
export async function clearExpiredCache(): Promise<number> {
  const supabase = createClient()

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() - CACHE_EXPIRATION_DAYS)

  const { error, count } = await supabase
    .from('book_cache')
    .delete()
    .lt('cached_at', expirationDate.toISOString())

  if (error) {
    console.error('Error clearing expired cache:', error)
    return 0
  }

  return count || 0
}
