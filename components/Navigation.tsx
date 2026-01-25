'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@base-ui/react/button'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getUserProfile } from '@/lib/api/userProfile'
import UserAvatar from '@/components/UserAvatar'

export default function Navigation() {
  const { user, loading } = useAuth()
  const [username, setUsername] = useState<string | null>(null)

  useEffect(() => {
    const loadUsername = async () => {
      if (user) {
        const profile = await getUserProfile()
        setUsername(profile?.username || null)
      } else {
        setUsername(null)
      }
    }

    if (!loading) {
      loadUsername()
    }
  }, [user, loading])

  return (
    <nav className="border-b border-warm-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-warm-text hover:text-warm-text-secondary transition-colors cursor-pointer">
                Bookdart
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-warm-text-secondary hover:text-warm-text transition-colors">
              Browse
            </Link>
            {user && username && (
              <Link href={`/${username}`} className="text-warm-text-secondary hover:text-warm-text transition-colors">
                @{username}
              </Link>
            )}
            {loading ? (
              <div className="w-10 h-10 bg-warm-border rounded-full animate-pulse" />
            ) : user ? (
              <UserAvatar />
            ) : (
              <Link href="/auth/signin">
                <Button className="bg-warm-text-secondary hover:bg-warm-text text-white px-4 py-2 rounded-lg transition-colors">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
