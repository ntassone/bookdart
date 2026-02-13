'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import LoadingIndicator from '@/components/LoadingIndicator'
import UserListItem from '@/components/UserListItem'
import { useProfileByUsername } from '@/lib/hooks/useProfileData'
import { useFollowers } from '@/lib/hooks/useFollows'

interface FollowersPageProps {
  params: {
    username: string
  }
}

export default function FollowersPage({ params }: FollowersPageProps) {
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(params.username)
  const { data: followers, isLoading: followersLoading } = useFollowers(profile?.user_id)

  const loading = profileLoading || followersLoading

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-warm-bg-secondary">
        <Navigation />
        <div className="flex items-center justify-center flex-1">
          <LoadingIndicator size="lg" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-warm-bg-secondary">
        <Navigation />
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold text-warm-text">User not found</h1>
            <Link href="/" className="text-warm-text-secondary hover:text-warm-text transition-colors">
              Return home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-warm-bg-secondary">
      <Navigation />

      <div className="flex-1 w-full px-4 py-12 mx-auto max-w-3xl sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${params.username}`}
            className="text-warm-text-secondary hover:text-warm-text transition-colors"
          >
            &larr; Back to @{params.username}
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-warm-text">
            Followers
          </h1>
          <p className="text-warm-text-secondary">
            {followers?.length || 0} {followers?.length === 1 ? 'person follows' : 'people follow'} @{params.username}
          </p>
        </div>

        {/* Followers List */}
        <div className="border border-warm-border bg-warm-bg-secondary">
          {followers && followers.length > 0 ? (
            <div className="divide-y divide-warm-border">
              {followers.map((follower) => (
                <UserListItem
                  key={follower.follow_id}
                  userId={follower.user_id}
                  username={follower.username}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-warm-text-secondary">No followers yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
