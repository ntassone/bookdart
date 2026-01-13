const RECENT_SEARCHES_KEY = 'bookdart_recent_searches'
const MAX_RECENT_SEARCHES = 5

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): void {
  if (typeof window === 'undefined') return
  if (!query.trim()) return

  try {
    const searches = getRecentSearches()

    // Remove if already exists (to move it to the front)
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase())

    // Add to front
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES)

    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save recent search:', error)
  }
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY)
  } catch (error) {
    console.error('Failed to clear recent searches:', error)
  }
}
