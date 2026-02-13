'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useIsFollowing, useFollowMutation, useUnfollowMutation } from '@/lib/hooks/useFollows'
import { useToast } from '@/lib/contexts/ToastContext'

interface UserListItemProps {
  userId: string
  username: string | null
}

export default function UserListItem({ userId, username }: UserListItemProps) {
  const { user } = useAuth()
  const { addToast } = useToast()

  const isOwnProfile = user?.id === userId
  const { data: isFollowingUser } = useIsFollowing(!isOwnProfile ? userId : undefined)
  const followMutation = useFollowMutation()
  const unfollowMutation = useUnfollowMutation()

  const handleFollowToggle = async () => {
    try {
      if (isFollowingUser) {
        await unfollowMutation.mutateAsync(userId)
        addToast('Unfollowed', 'success')
      } else {
        await followMutation.mutateAsync(userId)
        addToast('Following', 'success')
      }
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Failed to update', 'error')
    }
  }

  // Get initials for avatar placeholder
  const initials = username ? username.substring(0, 2).toUpperCase() : 'U'

  return (
    <div className="flex items-center justify-between p-4">
      <Link
        href={username ? `/${username}` : '#'}
        className="flex items-center gap-3 flex-1 min-w-0"
      >
        {/* Avatar placeholder */}
        <div className="w-10 h-10 bg-warm-border flex items-center justify-center flex-shrink-0">
          <span className="text-warm-text-secondary font-semibold text-sm">{initials}</span>
        </div>

        <div className="min-w-0">
          <p className="text-warm-text font-medium truncate">
            @{username || 'unknown'}
          </p>
        </div>
      </Link>

      {/* Follow button - don't show for own profile */}
      {!isOwnProfile && user && (
        <button
          onClick={handleFollowToggle}
          disabled={followMutation.isPending || unfollowMutation.isPending}
          className={`px-4 py-1.5 text-sm font-semibold transition-colors ${
            isFollowingUser
              ? 'bg-warm-bg border border-warm-border text-warm-text hover:bg-warm-bg-secondary'
              : 'bg-warm-text text-warm-bg-secondary hover:bg-warm-text-secondary'
          } disabled:opacity-50`}
        >
          {followMutation.isPending || unfollowMutation.isPending
            ? '...'
            : isFollowingUser
              ? 'Following'
              : 'Follow'}
        </button>
      )}
    </div>
  )
}
