import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UpdateProfileInput } from '@/lib/types/userProfile'

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
