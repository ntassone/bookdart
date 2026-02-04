'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import BookSearchResults from './BookSearchResults'
import { searchBooks } from '@/lib/api/openLibrary'
import { useToast } from '@/lib/contexts/ToastContext'
import type { Book } from '@/lib/types/book'

interface BookSearchPanelProps {
  onClose: () => void
  onBookSelected: () => void
}

export default function BookSearchPanel({ onClose, onBookSelected }: BookSearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addToast } = useToast()

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      setError(null)
      return
    }

    setLoadingBooks(true)
    setError(null)
    try {
      const results = await searchBooks(query)
      setSearchResults(results)
      if (results.length === 0) {
        setError(`No books found for "${query}"`)
      }
    } catch (err) {
      console.error('Failed to search books:', err)
      setError(err instanceof Error ? err.message : 'Failed to search books')
      addToast('Failed to search books', 'error')
    } finally {
      setLoadingBooks(false)
    }
  }

  const handleBookAdded = () => {
    onBookSelected()
    onClose()
  }

  return (
    <div className="flex flex-col w-full h-full bg-warm-text">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-white border-opacity-20">
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-semibold text-white text-l">What book are you reading?</h2>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-white transition-opacity text-opacity-60 hover:text-opacity-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute w-5 h-5 text-white -translate-y-1/2 left-3 top-1/2 text-opacity-40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title or author..."
            className="w-full py-3 pl-10 pr-4 text-white placeholder-white transition-colors bg-black border border-white outline-none bg-opacity-20 border-opacity-20 placeholder-opacity-40 focus:border-opacity-40"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 min-h-0 p-6 overflow-y-auto">
        <BookSearchResults
          books={searchResults}
          loading={loadingBooks}
          error={error}
          query={searchQuery}
          onBookAdded={handleBookAdded}
          theme="dark"
          gridClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
          loadingClassName="flex justify-start py-20"
          emptyStateClassName="text-left py-20"
          errorClassName="text-left py-20"
          emptyStateText=""
        />
      </div>
    </div>
  )
}
