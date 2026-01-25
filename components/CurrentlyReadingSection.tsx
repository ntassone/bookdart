'use client'

import { useState, useEffect } from 'react'
import CompactBookCard from './CompactBookCard'
import { getComplementaryGradient } from '@/lib/utils/colorExtractor'
import { getBookInLibrary, updateUserBook } from '@/lib/api/userBooks'
import { useToast } from '@/lib/contexts/ToastContext'
import { useReadBooks } from '@/lib/contexts/ReadBooksContext'
import type { Book } from '@/lib/types/book'
import type { UserBook } from '@/lib/types/userBook'

interface CurrentlyReadingSectionProps {
  books: Book[]
  onBookAdded?: () => void
  showLarge?: boolean
  editable?: boolean
}

/**
 * Displays books the user is currently reading
 */
export default function CurrentlyReadingSection({ books, onBookAdded, showLarge = false, editable = false }: CurrentlyReadingSectionProps) {
  // Show the first book or a placeholder
  const currentBook = books[0] || null
  const [backgroundStyle, setBackgroundStyle] = useState('linear-gradient(135deg, rgb(55, 65, 81), rgb(75, 85, 99))') // default gradient
  const [userBook, setUserBook] = useState<UserBook | null>(null)
  const [isEditingProgress, setIsEditingProgress] = useState(false)
  const [progressInput, setProgressInput] = useState('')
  const { addToast } = useToast()
  const { addReadBook } = useReadBooks()

  // Extract complementary gradient from book cover when book changes
  useEffect(() => {
    if (currentBook?.coverUrl && showLarge) {
      getComplementaryGradient(currentBook.coverUrl, 0.4).then(setBackgroundStyle)
    } else {
      setBackgroundStyle('linear-gradient(135deg, rgb(55, 65, 81), rgb(75, 85, 99))') // default gradient
    }
  }, [currentBook?.id, currentBook?.coverUrl, showLarge])

  // Fetch user book data to get progress
  useEffect(() => {
    if (currentBook && editable) {
      getBookInLibrary(currentBook.id).then(books => {
        const reading = books.find(b => b.status === 'reading')
        setUserBook(reading || null)
        setProgressInput(String(reading?.progress || 0))
      })
    }
  }, [currentBook?.id, editable])

  const handleUpdateProgress = async () => {
    if (!userBook) return

    const progress = Math.min(100, Math.max(0, parseInt(progressInput) || 0))

    try {
      await updateUserBook(userBook.id, { progress })
      setUserBook({ ...userBook, progress })
      setIsEditingProgress(false)
      addToast('Progress updated', 'success')
    } catch (error) {
      console.error('Failed to update progress:', error)
      addToast(`Failed to update progress: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const handleMarkComplete = async () => {
    if (!userBook || !currentBook) return

    try {
      await updateUserBook(userBook.id, {
        status: 'read',
        progress: 100,
        date_finished: new Date().toISOString()
      })
      addReadBook(currentBook.id)
      addToast('Marked as read!', 'success')
      onBookAdded?.()
    } catch (error) {
      addToast('Failed to mark as read', 'error')
    }
  }

  if (showLarge) {
    // Large version for profile header
    return (
      <div className="relative h-full transition-all duration-500 overflow-hidden" style={{ backgroundImage: backgroundStyle }}>
        <div className="absolute inset-0 p-4 flex flex-col">
          <div className="flex-1 relative">
            {currentBook ? (
              <>
                {currentBook.coverUrl ? (
                  <img
                    src={currentBook.coverUrl}
                    alt={currentBook.title}
                    className="w-full h-full object-contain"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-600">
                    <p className="text-gray-200 text-center text-lg font-bold px-4">
                      {currentBook.title}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {/* Loading skeleton that matches content layout */}
                <div className="w-full h-full bg-gray-600 animate-pulse" />
              </div>
            )}
          </div>

          {/* Progress bar at bottom */}
          <div className="mt-4">
            {currentBook ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-xs font-bold uppercase tracking-wide">READING NOW</span>
                  {editable ? (
                    <div className="flex items-center gap-2">
                      {isEditingProgress ? (
                        <>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={progressInput}
                            onChange={(e) => setProgressInput(e.target.value)}
                            className="w-16 px-2 py-1 text-sm text-warm-text border border-warm-border"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateProgress()
                              if (e.key === 'Escape') setIsEditingProgress(false)
                            }}
                            autoFocus
                          />
                          <button
                            onClick={handleUpdateProgress}
                            className="text-white hover:text-gray-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingProgress(true)}
                          className="text-white text-base font-bold hover:text-gray-200 border border-white px-2 py-0.5"
                        >
                          {userBook?.progress || 0}%
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-white text-base font-bold border border-white px-2 py-0.5">{userBook?.progress || 0}%</span>
                  )}
                </div>
                <div className="w-full bg-white bg-opacity-30 h-1.5">
                  <div className="bg-white h-1.5 transition-all duration-300" style={{ width: `${userBook?.progress || 0}%` }} />
                </div>
              </>
            ) : (
              <>
                {/* Loading skeleton for progress section */}
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-24 bg-gray-600 animate-pulse" />
                  <div className="h-5 w-12 bg-gray-600 animate-pulse" />
                </div>
                <div className="w-full bg-gray-600 h-1.5">
                  <div className="bg-gray-500 h-1.5 w-0" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Compact version
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-warm-text whitespace-nowrap">Reading Now</h2>
      {currentBook ? (
        <CompactBookCard
          key={currentBook.id}
          book={currentBook}
          showAddButton={true}
          onBookAdded={onBookAdded}
          hideWantToRead={true}
        />
      ) : (
        // Empty placeholder matching favorite book style
        <div className="aspect-[2/3] border border-warm-border bg-warm-text-tertiary opacity-30" />
      )}
    </div>
  )
}
