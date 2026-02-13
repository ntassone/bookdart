'use client'

import Link from 'next/link'
import Navigation from '@/components/Navigation'
import LoadingIndicator from '@/components/LoadingIndicator'
import UserListItem from '@/components/UserListItem'
import { useProfileByUsername } from '@/lib/hooks/useProfileData'
import { useFollowing } from '@/lib/hooks/useFollows'

interface FollowingPageProps {
  params: {
    username: string
  }
}

export default function FollowingPage({ params }: FollowingPageProps) {
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(params.username)
  const { data: following, isLoading: followingLoading } = useFollowing(profile?.user_id)

  const loading = profileLoading || followingLoading

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
            Following
          </h1>
          <p className="text-warm-text-secondary">
            @{params.username} follows {following?.length || 0} {following?.length === 1 ? 'person' : 'people'}
          </p>
        </div>

        {/* Following List */}
        <div className="border border-warm-border bg-warm-bg-secondary">
          {following && following.length > 0 ? (
            <div className="divide-y divide-warm-border">
              {following.map((user) => (
                <UserListItem
                  key={user.follow_id}
                  userId={user.user_id}
                  username={user.username}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-warm-text-secondary">Not following anyone yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
