import { createClient } from '@/lib/supabase/client'
import { getUserProfile, addRecentSearch as addRecentSearchAPI, removeRecentSearch as removeRecentSearchAPI } from '@/lib/api/userProfile'

const RECENT_SEARCHES_KEY = 'bookdart_recent_searches'
const MAX_RECENT_SEARCHES = 5

/**
 * Get recent searches from database if authenticated, otherwise from localStorage
 */
export async function getRecentSearches(): Promise<string[]> {
  if (typeof window === 'undefined') return []

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get from database
      const profile = await getUserProfile()
      return profile?.recent_searches || []
    } else {
      // Fallback to localStorage for unauthenticated users
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
      return stored ? JSON.parse(stored) : []
    }
  } catch (error) {
    console.error('Failed to get recent searches:', error)
    return []
  }
}

/**
 * Get recent searches synchronously from localStorage (for immediate display)
 */
export function getRecentSearchesSync(): string[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Add a search query to recent searches
 */
export async function addRecentSearch(query: string): Promise<void> {
  if (typeof window === 'undefined') return
  if (!query.trim()) return

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Save to database
      await addRecentSearchAPI(query)
    }

    // Always save to localStorage for immediate feedback
    const searches = getRecentSearchesSync()
    const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase())
    const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Failed to save recent search:', error)
  }
}

/**
 * Remove a search query from recent searches
 */
export async function removeRecentSearch(query: string): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Remove from database
      await removeRecentSearchAPI(query)
    }

    // Always update localStorage
    const searches = getRecentSearchesSync()
    const filtered = searches.filter(s => s !== query)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Failed to remove recent search:', error)
  }
}

/**
 * Sync localStorage with database on load (for authenticated users)
 */
export async function syncRecentSearches(): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const profile = await getUserProfile()
      if (profile?.recent_searches) {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(profile.recent_searches))
      }
    }
  } catch (error) {
    console.error('Failed to sync recent searches:', error)
  }
}
