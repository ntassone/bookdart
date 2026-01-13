'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@base-ui/react/button'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function Navigation() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

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
            <Link href="/my-books" className="text-gray-600 hover:text-gray-700 transition-colors">
              My Books
            </Link>
            {loading ? (
              <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{user.email}</span>
                <Button
                  onClick={handleSignOut}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sign Out
                </Button>
              </div>
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
