'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserBooks } from '@/lib/api/userBooks'

interface ReadBooksContextType {
  readBookIds: Set<string>
  addReadBook: (bookId: string) => void
  removeReadBook: (bookId: string) => void
  loading: boolean
}

const ReadBooksContext = createContext<ReadBooksContextType | undefined>(undefined)

export function ReadBooksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [readBookIds, setReadBookIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadReadBooks()
    } else {
      setReadBookIds(new Set())
      setLoading(false)
    }
  }, [user])

  const loadReadBooks = async () => {
    setLoading(true)
    try {
      const books = await getUserBooks('read')
      setReadBookIds(new Set(books.map(b => b.book_id)))
    } catch (error) {
      console.error('Failed to load read books:', error)
    } finally {
      setLoading(false)
    }
  }

  const addReadBook = (bookId: string) => {
    setReadBookIds(prev => new Set(prev).add(bookId))
  }

  const removeReadBook = (bookId: string) => {
    setReadBookIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(bookId)
      return newSet
    })
  }

  return (
    <ReadBooksContext.Provider value={{ readBookIds, addReadBook, removeReadBook, loading }}>
      {children}
    </ReadBooksContext.Provider>
  )
}

export function useReadBooks() {
  const context = useContext(ReadBooksContext)
  if (context === undefined) {
    throw new Error('useReadBooks must be used within a ReadBooksProvider')
  }
  return context
}
