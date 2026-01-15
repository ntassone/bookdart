import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UpdateProfileInput } from '@/lib/types/userProfile'
import type { Book } from '@/lib/types/book'

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .single()

  if (error) {
    // If profile doesn't exist, create it
    if (error.code === 'PGRST116') {
      const { data: user } = await supabase.auth.getUser()
      if (user.user) {
        return await createUserProfile(user.user.id)
      }
    }
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Create a new user profile
 */
async function createUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({ user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(input: UpdateProfileInput): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Add a book to favorites (max 4)
 */
export async function addToFavorites(bookId: string): Promise<UserProfile | null> {
  const profile = await getUserProfile()
  if (!profile) return null

  const favorites = profile.favorite_books || []

  // Don't add if already in favorites
  if (favorites.includes(bookId)) {
    return profile
  }

  // Limit to 4 favorites
  if (favorites.length >= 4) {
    throw new Error('You can only have 4 favorite books')
  }

  return await updateUserProfile({
    favorite_books: [...favorites, bookId]
  })
}

/**
 * Remove a book from favorites
 */
export async function removeFromFavorites(bookId: string): Promise<UserProfile | null> {
  const profile = await getUserProfile()
  if (!profile) return null

  const favorites = profile.favorite_books || []

  return await updateUserProfile({
    favorite_books: favorites.filter(id => id !== bookId)
  })
}

/**
 * Reorder favorite books
 */
export async function reorderFavorites(bookIds: string[]): Promise<UserProfile | null> {
  // Limit to 4
  if (bookIds.length > 4) {
    throw new Error('You can only have 4 favorite books')
  }

  return await updateUserProfile({
    favorite_books: bookIds
  })
}

/**
 * Update fade completed books setting
 */
export async function updateFadeCompletedBooks(fadeCompleted: boolean): Promise<UserProfile | null> {
  return await updateUserProfile({
    fade_completed_books: fadeCompleted
  })
}

/**
 * Add a search query to recent searches (max 5)
 */
export async function addRecentSearch(query: string): Promise<UserProfile | null> {
  if (!query.trim()) return null

  const profile = await getUserProfile()
  if (!profile) return null

  const searches = profile.recent_searches || []

  // Remove if already exists (to move it to the front)
  const filtered = searches.filter(s => s.toLowerCase() !== query.toLowerCase())

  // Add to front, limit to 5
  const updated = [query, ...filtered].slice(0, 5)

  return await updateUserProfile({
    recent_searches: updated
  })
}

/**
 * Remove a search query from recent searches
 */
export async function removeRecentSearch(query: string): Promise<UserProfile | null> {
  const profile = await getUserProfile()
  if (!profile) return null

  const searches = profile.recent_searches || []

  return await updateUserProfile({
    recent_searches: searches.filter(s => s !== query)
  })
}

/**
 * Add a book to recent books (max 10)
 */
export async function addRecentBook(book: Book): Promise<UserProfile | null> {
  const profile = await getUserProfile()
  if (!profile) return null

  const books = profile.recent_books || []

  // Remove if already exists
  const filtered = books.filter(b => b.id !== book.id)

  // Add to beginning, limit to 10
  const updated = [book, ...filtered].slice(0, 10)

  return await updateUserProfile({
    recent_books: updated
  })
}

/**
 * Remove a book from recent books
 */
export async function removeRecentBook(bookId: string): Promise<UserProfile | null> {
  const profile = await getUserProfile()
  if (!profile) return null

  const books = profile.recent_books || []

  return await updateUserProfile({
    recent_books: books.filter(b => b.id !== bookId)
  })
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(username: string): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('username', username)
    .maybeSingle()

  if (error) {
    console.error('Error checking username availability:', error)
    return false
  }

  return data === null
}

/**
 * Set username for the current user
 */
export async function setUsername(username: string): Promise<UserProfile | null> {
  // Validate username format
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/
  if (!usernameRegex.test(username)) {
    throw new Error('Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens')
  }

  // Check availability
  const isAvailable = await checkUsernameAvailability(username)
  if (!isAvailable) {
    throw new Error('Username is already taken')
  }

  return await updateUserProfile({ username })
}

/**
 * Get a user profile by username
 */
export async function getUserProfileByUsername(username: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    console.error('Error fetching profile by username:', error)
    return null
  }

  return data
}
