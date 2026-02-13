import { createClient } from '@/lib/supabase/client'
import type { UserFollow, FollowCounts, FollowerWithProfile, FollowingWithProfile } from '@/lib/types/userFollow'

/**
 * Follow a user
 */
export async function followUser(userId: string): Promise<UserFollow> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (user.id === userId) throw new Error('Cannot follow yourself')

  const { data, error } = await supabase
    .from('user_follows')
    .insert({
      follower_id: user.id,
      following_id: userId,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      throw new Error('Already following this user')
    }
    throw error
  }

  return data
}

/**
 * Unfollow a user
 */
export async function unfollowUser(userId: string): Promise<void> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', userId)

  if (error) throw error
}

/**
 * Get followers for a user (users who follow them)
 * Joins with user_profiles to get username
 */
export async function getFollowers(userId: string): Promise<FollowerWithProfile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      id,
      follower_id,
      created_at,
      user_profiles!inner(user_id, username)
    `)
    .eq('following_id', userId)
    .eq('user_profiles.user_id', supabase.rpc('get_follower_id'))
    .order('created_at', { ascending: false })

  if (error) {
    // If join fails, try simpler query
    const { data: simpleData, error: simpleError } = await supabase
      .from('user_follows')
      .select('id, follower_id, created_at')
      .eq('following_id', userId)
      .order('created_at', { ascending: false })

    if (simpleError) throw simpleError

    // Fetch profiles separately
    const followerIds = (simpleData || []).map(f => f.follower_id)
    if (followerIds.length === 0) return []

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, username')
      .in('user_id', followerIds)

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p.username]))

    return (simpleData || []).map(row => ({
      follow_id: row.id,
      user_id: row.follower_id,
      username: profileMap.get(row.follower_id) || null,
      created_at: row.created_at,
    }))
  }

  return (data || []).map(row => ({
    follow_id: row.id,
    user_id: row.follower_id,
    username: (row.user_profiles as unknown as { username: string | null })?.username || null,
    created_at: row.created_at,
  }))
}

/**
 * Get users that a user is following
 * Joins with user_profiles to get username
 */
export async function getFollowing(userId: string): Promise<FollowingWithProfile[]> {
  const supabase = createClient()

  // Use simpler approach - fetch follows then profiles
  const { data: followData, error } = await supabase
    .from('user_follows')
    .select('id, following_id, created_at')
    .eq('follower_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const followingIds = (followData || []).map(f => f.following_id)
  if (followingIds.length === 0) return []

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, username')
    .in('user_id', followingIds)

  const profileMap = new Map((profiles || []).map(p => [p.user_id, p.username]))

  return (followData || []).map(row => ({
    follow_id: row.id,
    user_id: row.following_id,
    username: profileMap.get(row.following_id) || null,
    created_at: row.created_at,
  }))
}

/**
 * Get follower and following counts for a user
 * Uses count aggregation for efficiency
 */
export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const supabase = createClient()

  // Run both count queries in parallel
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('user_follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ])

  if (followersResult.error) throw followersResult.error
  if (followingResult.error) throw followingResult.error

  return {
    followers: followersResult.count || 0,
    following: followingResult.count || 0,
  }
}

/**
 * Check if the current user is following a specific user
 */
export async function isFollowing(userId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', userId)
    .maybeSingle()

  if (error) throw error

  return data !== null
}

/**
 * Batch check if current user is following multiple users
 * Useful for rendering lists with follow buttons
 */
export async function isFollowingBatch(userIds: string[]): Promise<Record<string, boolean>> {
  if (userIds.length === 0) return {}

  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return userIds.reduce((acc, id) => ({ ...acc, [id]: false }), {})

  const { data, error } = await supabase
    .from('user_follows')
    .select('following_id')
    .eq('follower_id', user.id)
    .in('following_id', userIds)

  if (error) throw error

  const followingSet = new Set((data || []).map(row => row.following_id))
  return userIds.reduce((acc, id) => ({ ...acc, [id]: followingSet.has(id) }), {})
}
