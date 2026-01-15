import type { Book } from '@/lib/types/book'
import { createClient } from '@/lib/supabase/client'
import { getUserProfile, addRecentBook as addRecentBookAPI, removeRecentBook as removeRecentBookAPI } from '@/lib/api/userProfile'

const STORAGE_KEY = 'bookdart_recent_books'
const MAX_RECENT_BOOKS = 10

/**
 * Get recent books from database if authenticated, otherwise from localStorage
 */
export async function getRecentBooks(): Promise<Book[]> {
  if (typeof window === 'undefined') return []

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get from database
      const profile = await getUserProfile()
      return profile?.recent_books || []
    } else {
      // Fallback to localStorage for unauthenticated users
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    }
  } catch (error) {
    console.error('Failed to get recent books:', error)
    return []
  }
}

/**
 * Get recent books synchronously from localStorage (for immediate display)
 */
export function getRecentBooksSync(): Book[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get recent books:', error)
    return []
  }
}

/**
 * Add a book to recent books
 */
export async function addRecentBook(book: Book): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Save to database
      await addRecentBookAPI(book)
    }

    // Always save to localStorage for immediate feedback
    const recent = getRecentBooksSync()
    const filtered = recent.filter(b => b.id !== book.id)
    const updated = [book, ...filtered].slice(0, MAX_RECENT_BOOKS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to add recent book:', error)
  }
}

/**
 * Remove a book from recent books
 */
export async function removeRecentBook(bookId: string): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Remove from database
      await removeRecentBookAPI(bookId)
    }

    // Always update localStorage
    const recent = getRecentBooksSync()
    const filtered = recent.filter(b => b.id !== bookId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove recent book:', error)
  }
}

/**
 * Sync localStorage with database on load (for authenticated users)
 */
export async function syncRecentBooks(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const profile = await getUserProfile()
      if (profile?.recent_books) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile.recent_books))
      }
    }
  } catch (error) {
    console.error('Failed to sync recent books:', error)
  }
}
