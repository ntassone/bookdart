'use client'

import { useEffect } from 'react'

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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Something went wrong!</h2>
        <p className="text-neutral-600 mb-6">{error.message || 'An unexpected error occurred'}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
