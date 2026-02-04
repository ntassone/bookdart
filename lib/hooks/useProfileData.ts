'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserBooks, getUserBooksByUserId } from '@/lib/api/userBooks'
import { getUserProfile, getUserProfileByUsername, addToFavorites, removeFromFavorites, reorderFavorites } from '@/lib/api/userProfile'
import { getCachedBooks } from '@/lib/api/bookCache'
import type { UserBook, BookStatus } from '@/lib/types/userBook'
import type { Book } from '@/lib/types/book'
import type { UserProfile } from '@/lib/types/userProfile'

// Query keys for cache management
export const profileKeys = {
  all: ['profiles'] as const,
  byUsername: (username: string) => [...profileKeys.all, 'username', username] as const,
  current: () => [...profileKeys.all, 'current'] as const,
}

export const booksKeys = {
  all: ['books'] as const,
  byStatus: (status?: BookStatus) => [...booksKeys.all, 'status', status ?? 'all'] as const,
  byUserId: (userId: string, status?: BookStatus) => [...booksKeys.all, 'user', userId, status ?? 'all'] as const,
  cached: (ids: string[]) => [...booksKeys.all, 'cached', ids.sort().join(',')] as const,
}

// Hook to fetch profile by username
export function useProfileByUsername(username: string) {
  return useQuery({
    queryKey: profileKeys.byUsername(username),
    queryFn: () => getUserProfileByUsername(username),
  })
}

// Hook to fetch current user's profile
export function useCurrentUserProfile() {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: () => getUserProfile(),
  })
}

// Hook to fetch current user's books
export function useUserBooks(filter?: BookStatus) {
  return useQuery({
    queryKey: booksKeys.byStatus(filter),
    queryFn: () => getUserBooks(filter === 'all' ? undefined : filter),
  })
}

// Hook to fetch any user's books by their user_id
export function useUserBooksByUserId(userId: string | undefined, filter?: BookStatus) {
  return useQuery({
    queryKey: booksKeys.byUserId(userId ?? '', filter),
    queryFn: () => getUserBooksByUserId(userId!, filter === 'all' ? undefined : filter),
    enabled: !!userId,
  })
}

// Hook to fetch cached books by IDs
export function useCachedBooks(bookIds: string[]) {
  return useQuery({
    queryKey: booksKeys.cached(bookIds),
    queryFn: async () => {
      if (bookIds.length === 0) return []
      const cachedBooks = await getCachedBooks(bookIds)
      return bookIds
        .map(id => cachedBooks.get(id))
        .filter((book): book is Book => book !== undefined)
    },
    enabled: bookIds.length > 0,
  })
}

// Mutation hook for adding to favorites
export function useAddToFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: string) => addToFavorites(bookId),
    onSuccess: (_, variables) => {
      // Invalidate profile queries to refetch
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}

// Mutation hook for removing from favorites
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: string) => removeFromFavorites(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}

// Mutation hook for reordering favorites
export function useReorderFavorites() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookIds: string[]) => reorderFavorites(bookIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}
