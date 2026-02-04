'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navigation />

      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Unable to load book</h2>
          <p className="text-neutral-600 mb-6">
            {error.message || 'An error occurred while loading this book'}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={reset}
              className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Try again
            </button>
            <Link
              href="/search"
              className="px-4 py-2 bg-white text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Back to Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
