'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Check, X, MoreVertical, Search, PlusSquare, PlusSquareIcon } from 'lucide-react'
import { Tooltip } from '@base-ui/react/tooltip'
import CompactBookCard from './CompactBookCard'
import { getBookInLibrary, updateUserBook, removeBookFromLibrary } from '@/lib/api/userBooks'
import { useToast } from '@/lib/contexts/ToastContext'
import { useReadBooks } from '@/lib/contexts/ReadBooksContext'
import type { Book } from '@/lib/types/book'
import type { UserBook } from '@/lib/types/userBook'

interface CurrentlyReadingSectionProps {
  books: Book[]
  onBookAdded?: () => void
  onBookRemoved?: () => void
  showLarge?: boolean
  editable?: boolean
  bookStatuses?: Record<string, UserBook[]>
  onSearchModeChange?: (isSearching: boolean) => void
  isSearchMode?: boolean
}

/**
 * Displays books the user is currently reading
 */
export default function CurrentlyReadingSection({ books, onBookAdded, onBookRemoved, showLarge = false, editable = false, bookStatuses, onSearchModeChange, isSearchMode = false }: CurrentlyReadingSectionProps) {
  // Show the first book or a placeholder
  const currentBook = books[0] || null
  const [userBook, setUserBook] = useState<UserBook | null>(null)
  const [isEditingProgress, setIsEditingProgress] = useState(false)
  const [progressInput, setProgressInput] = useState('')
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const { addToast } = useToast()
  const { addReadBook } = useReadBooks()
  const menuRef = useRef<HTMLDivElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Fetch user book data to get progress
  useEffect(() => {
    if (currentBook && editable) {
      getBookInLibrary(currentBook.id).then(books => {
        const reading = books.find(b => b.status === 'reading')
        setUserBook(reading || null)
        setProgressInput(String(reading?.progress || 0))
      })
    }
  }, [currentBook, editable])

  const handleUpdateProgress = useCallback(async () => {
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
  }, [userBook, progressInput, addToast])

  // Close menu when clicking outside and save
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleUpdateProgress()
        setIsEditingProgress(false)
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setIsContextMenuOpen(false)
      }
    }

    if (isEditingProgress || isContextMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isEditingProgress, isContextMenuOpen, handleUpdateProgress])

  const handleMarkComplete = async () => {
    if (!userBook || !currentBook) return

    try {
      // Check if user already has a 'read' record for this book
      const existingRecords = await getBookInLibrary(currentBook.id)
      const existingReadRecord = existingRecords.find(b => b.status === 'read')

      if (existingReadRecord) {
        // If a 'read' record already exists, just remove the 'reading' record
        await removeBookFromLibrary(userBook.id)
        // Update the existing 'read' record with the new completion date
        await updateUserBook(existingReadRecord.id, {
          date_finished: new Date().toISOString(),
          read_count: (existingReadRecord.read_count || 0) + 1
        })
      } else {
        // No existing 'read' record, so we can safely update the 'reading' record
        await updateUserBook(userBook.id, {
          status: 'read',
          progress: 100,
          date_finished: new Date().toISOString()
        })
      }

      // Add to read books list
      try {
        addReadBook(currentBook.id)
      } catch (readBooksError) {
        console.error('Error adding to read books:', readBooksError)
      }

      setIsEditingProgress(false)
      setIsContextMenuOpen(false)

      addToast('Marked as read!', 'success')

      // Call callbacks after showing toast
      onBookRemoved?.()
      onBookAdded?.()
    } catch (error) {
      console.error('Failed to mark as read:', error)
      const errorMessage = error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error)
      addToast(`Failed to mark as read: ${errorMessage}`, 'error')
    }
  }

  const handleRemoveFromReading = async () => {
    if (!userBook) return

    try {
      await removeBookFromLibrary(userBook.id)
      setIsEditingProgress(false)
      addToast('Removed from Reading Now', 'success')
      onBookRemoved?.()
      onBookAdded?.()
    } catch (error) {
      console.error('Failed to remove from reading:', error)
      addToast(`Failed to remove from reading: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')
    }
  }

  const handleOpenModal = () => {
    onSearchModeChange?.(true)
  }

  if (showLarge) {
    // Large version for profile header
    return (
      <div className="relative flex flex-col h-full overflow-hidden bg-warm-text">
        <div className="flex flex-col flex-1 p-4">
          <div className="flex items-center justify-center flex-1">
            <div className="max-w-[160px] w-full aspect-[2/3] relative">
              {currentBook ? (
                <>
                  {currentBook.coverUrl ? (
                    <img
                      src={currentBook.coverUrl}
                      alt={currentBook.title}
                      className="object-cover w-full h-full"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-neutral-600">
                      <p className="px-4 text-lg font-bold text-center text-neutral-200">
                        {currentBook.title}
                      </p>
                    </div>
                  )}
                </>
              ) : editable ? (
                <Tooltip.Root>
                  <Tooltip.Trigger
                    onClick={handleOpenModal}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className={`relative flex items-center justify-center w-full h-full overflow-hidden border cursor-pointer bg-neutral-600 bg-gradient-to-br ${
                      isSearchMode
                        ? 'border-white/30 from-neutral-700/40'
                        : 'border-transparent from-neutral-700/20 hover:from-neutral-700/40 hover:border-white/30'
                    } to-transparent`}
                    style={{
                      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 8px)'
                    }}
                  >
                    {(isHovering || isSearchMode) && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-1">
                        <PlusSquareIcon strokeWidth={1} className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Positioner sideOffset={4}>
                      <Tooltip.Popup className="z-50 px-2 py-1 text-xs bg-warm-bg-secondary text-warm-text border border-warm-border transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
                        Select a book to track progress
                      </Tooltip.Popup>
                    </Tooltip.Positioner>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ) : (
                <div
                  className="relative flex items-center justify-center w-full h-full overflow-hidden transition-all duration-300 bg-neutral-600 bg-gradient-to-br from-neutral-700/20 to-transparent"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 8px)'
                  }}
                />
              )}
            </div>
          </div>

          {/* Progress bar at bottom */}
          <div className="mt-4">
            <div className={`flex items-center mb-2 ${currentBook ? 'justify-between' : 'justify-center'}`}>
              <span className="text-xs font-semibold tracking-wide uppercase text-opacity-80 text-neutral-100">Reading now</span>
              {currentBook && editable ? (
                <div className="relative" ref={menuRef}>
                  <input
                    type="text"
                    value={`${progressInput}%`}
                    onChange={(e) => {
                      const value = e.target.value.replace('%', '')
                      if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 100)) {
                        setProgressInput(value)
                      }
                    }}
                    onFocus={() => setIsEditingProgress(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUpdateProgress()
                        e.currentTarget.blur()
                      }
                      if (e.key === 'Escape') {
                        setIsEditingProgress(false)
                        e.currentTarget.blur()
                      }
                    }}
                    className={`text-white text-base font-bold border border-white px-2 py-0.5 bg-transparent text-center w-16 outline-none focus:outline-none focus:ring-0 cursor-pointer ${
                      isEditingProgress ? 'border-opacity-70' : 'border-opacity-50 hover:border-opacity-70'
                    }`}
                  />

                  {isEditingProgress && (
                    <div className="absolute right-0 z-10 w-56 p-3 mb-2 border border-white shadow-lg bottom-full bg-warm-text border-opacity-20">
                      <div className="space-y-3">
                        {/* Mark as Complete button with More menu */}
                        <div className="flex items-stretch gap-1">
                          <button
                            onClick={handleMarkComplete}
                            className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-xs text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 whitespace-nowrap"
                          >
                            <Check className="w-3 h-3" />
                            Mark as Complete
                          </button>
                          <div className="relative flex" ref={contextMenuRef}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsContextMenuOpen(!isContextMenuOpen)
                              }}
                              className="flex items-center justify-center h-full px-3 py-2 text-xs text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>

                            {/* Context menu */}
                            {isContextMenuOpen && (
                              <div className="absolute right-0 z-20 w-48 mt-1 border border-white shadow-lg top-full bg-warm-text border-opacity-20">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveFromReading()
                                    setIsContextMenuOpen(false)
                                  }}
                                  className="flex items-center w-full gap-2 px-3 py-2 text-xs text-left text-white hover:bg-white hover:bg-opacity-10"
                                >
                                  <X className="w-3 h-3" />
                                  Remove from Reading
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progress adjustment buttons */}
                        <div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setProgressInput(String(Math.max(0, (parseInt(progressInput) || 0) - 5)))}
                              className="flex items-center justify-center flex-1 py-2 text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
                            >
                              − 5%
                            </button>
                            <button
                              onClick={() => setProgressInput(String(Math.min(100, (parseInt(progressInput) || 0) + 5)))}
                              className="flex items-center justify-center flex-1 py-2 text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10"
                            >
                              + 5%
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : currentBook ? (
                <span className="text-white text-base font-bold px-2 py-0.5">{userBook?.progress || 0}%</span>
              ) : null}
            </div>
            {currentBook ? (
              <div className="w-full bg-white bg-opacity-30 h-1.5">
                <div className="bg-white h-1.5 transition-all duration-300" style={{ width: `${userBook?.progress || 0}%` }} />
              </div>
            ) : editable ? (
              <button
                onClick={handleOpenModal}
                className="w-full text-xs text-center text-white transition-opacity text-opacity-70 hover:text-opacity-90"
              >
                What are you reading?
              </button>
            ) : (
              <p className="text-xs italic text-center text-white text-opacity-70">Not reading anything currently</p>
            )}
          </div>
        </div>
      </div>
    )
  }
}
