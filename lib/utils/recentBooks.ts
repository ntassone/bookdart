import type { Book } from '@/lib/types/book'

const STORAGE_KEY = 'bookdart_recent_books'
const MAX_RECENT_BOOKS = 10

export function getRecentBooks(): Book[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get recent books:', error)
    return []
  }
}

export function addRecentBook(book: Book): void {
  if (typeof window === 'undefined') return

  try {
    const recent = getRecentBooks()

    // Remove if already exists
    const filtered = recent.filter(b => b.id !== book.id)

    // Add to beginning
    const updated = [book, ...filtered].slice(0, MAX_RECENT_BOOKS)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to add recent book:', error)
  }
}

export function removeRecentBook(bookId: string): void {
  if (typeof window === 'undefined') return

  try {
    const recent = getRecentBooks()
    const filtered = recent.filter(b => b.id !== bookId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove recent book:', error)
  }
}

export function clearRecentBooks(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear recent books:', error)
  }
}
