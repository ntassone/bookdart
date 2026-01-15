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
    <nav className="border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-700 hover:text-gray-600 transition-colors cursor-pointer">
                Bookdart
              </h1>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/search" className="text-gray-600 hover:text-gray-700 transition-colors">
              Browse
            </Link>
            {user && username && (
              <Link href={`/${username}`} className="text-gray-600 hover:text-gray-700 transition-colors">
                My Books
              </Link>
            )}
            {loading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : user ? (
              <UserAvatar />
            ) : (
              <Link href="/auth/signin">
                <Button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
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
