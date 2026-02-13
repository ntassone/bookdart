'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowCounts,
  isFollowing,
  isFollowingBatch
} from '@/lib/api/follows'

// Query keys for cache management
export const followsKeys = {
  all: ['follows'] as const,
  followers: (userId: string) => [...followsKeys.all, 'followers', userId] as const,
  following: (userId: string) => [...followsKeys.all, 'following', userId] as const,
  counts: (userId: string) => [...followsKeys.all, 'counts', userId] as const,
  isFollowing: (userId: string) => [...followsKeys.all, 'isFollowing', userId] as const,
  isFollowingBatch: (userIds: string[]) => [...followsKeys.all, 'isFollowingBatch', userIds.sort().join(',')] as const,
}

/**
 * Hook to fetch followers for a user
 */
export function useFollowers(userId: string | undefined) {
  return useQuery({
    queryKey: followsKeys.followers(userId ?? ''),
    queryFn: () => getFollowers(userId!),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch users that a user is following
 */
export function useFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: followsKeys.following(userId ?? ''),
    queryFn: () => getFollowing(userId!),
    enabled: !!userId,
  })
}

/**
 * Hook to fetch follow counts for a user
 */
export function useFollowCounts(userId: string | undefined) {
  return useQuery({
    queryKey: followsKeys.counts(userId ?? ''),
    queryFn: () => getFollowCounts(userId!),
    enabled: !!userId,
  })
}

/**
 * Hook to check if current user is following a specific user
 */
export function useIsFollowing(userId: string | undefined) {
  return useQuery({
    queryKey: followsKeys.isFollowing(userId ?? ''),
    queryFn: () => isFollowing(userId!),
    enabled: !!userId,
  })
}

/**
 * Hook to batch check if current user is following multiple users
 */
export function useIsFollowingBatch(userIds: string[]) {
  return useQuery({
    queryKey: followsKeys.isFollowingBatch(userIds),
    queryFn: () => isFollowingBatch(userIds),
    enabled: userIds.length > 0,
  })
}

/**
 * Mutation hook for following a user
 */
export function useFollowMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: followsKeys.isFollowing(userId) })
      queryClient.invalidateQueries({ queryKey: followsKeys.counts(userId) })
      // Also invalidate current user's following list
      queryClient.invalidateQueries({ queryKey: ['follows', 'following'] })
      // Invalidate batch queries that might include this user
      queryClient.invalidateQueries({ queryKey: ['follows', 'isFollowingBatch'] })
    },
  })
}

/**
 * Mutation hook for unfollowing a user
 */
export function useUnfollowMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onSuccess: (_, userId) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: followsKeys.isFollowing(userId) })
      queryClient.invalidateQueries({ queryKey: followsKeys.counts(userId) })
      // Also invalidate current user's following list
      queryClient.invalidateQueries({ queryKey: ['follows', 'following'] })
      // Invalidate batch queries that might include this user
      queryClient.invalidateQueries({ queryKey: ['follows', 'isFollowingBatch'] })
    },
  })
}
