'use client'

import { useState } from 'react'
import { Menu } from '@base-ui/react/menu'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useReadBooks } from '@/lib/contexts/ReadBooksContext'
import { addBookToLibrary } from '@/lib/api/userBooks'
import type { Book } from '@/lib/types/book'
import type { BookStatus } from '@/lib/types/userBook'

interface AddToLibraryButtonProps {
  book: Book
  onAdded?: () => void
}

export default function AddToLibraryButton({ book, onAdded }: AddToLibraryButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const { addReadBook } = useReadBooks()
  const [loading, setLoading] = useState(false)

  const handleAddToList = async (status: BookStatus) => {
    if (!user) {
      router.push('/auth/signin')
      return
    }

    setLoading(true)
    try {
      await addBookToLibrary({
        book_id: book.id,
        status,
        title: book.title,
        authors: book.authors,
        publish_year: book.publishYear,
        cover_url: book.coverUrl,
        isbn: book.isbn,
      })

      // Update ReadBooksContext if adding to read list
      if (status === 'read') {
        addReadBook(book.id)
      }

      onAdded?.()
    } catch (error) {
      console.error('Failed to add book:', error)
      alert(error instanceof Error ? error.message : 'Failed to add book')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Menu.Root>
      <Menu.Trigger
        onClick={(e) => e.stopPropagation()}
        className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-semibold disabled:opacity-50"
        disabled={loading}
      >
        Add to List +
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-50"
        >
          <Menu.Popup className="min-w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation()
                handleAddToList('want-to-read')
              }}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer outline-none data-[highlighted]:bg-gray-50"
            >
              Want to Read
            </Menu.Item>
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation()
                handleAddToList('reading')
              }}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer outline-none data-[highlighted]:bg-gray-50"
            >
              Reading Now
            </Menu.Item>
            <Menu.Item
              onClick={(e) => {
                e.stopPropagation()
                handleAddToList('read')
              }}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer outline-none data-[highlighted]:bg-gray-50"
            >
              Read
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
