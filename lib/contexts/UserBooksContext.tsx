'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserBooks } from '@/lib/api/userBooks'
import type { UserBook } from '@/lib/types/userBook'

interface UserBooksContextType {
  userBooks: UserBook[]
  loading: boolean
  addOptimistic: (book: UserBook) => void
  removeOptimistic: (bookId: string, status: string) => void
  updateOptimistic: (bookId: string, updates: Partial<UserBook>) => void
  refresh: () => Promise<void>
}

const UserBooksContext = createContext<UserBooksContextType | undefined>(undefined)

export function UserBooksProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [userBooks, setUserBooks] = useState<UserBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadUserBooks()
    } else {
      setUserBooks([])
      setLoading(false)
    }
  }, [user])

  const loadUserBooks = async () => {
    setLoading(true)
    try {
      const books = await getUserBooks()
      setUserBooks(books)
    } catch (error) {
      console.error('Failed to load user books:', error)
    } finally {
      setLoading(false)
    }
  }

  const addOptimistic = (book: UserBook) => {
    setUserBooks(prev => [book, ...prev])
  }

  const removeOptimistic = (bookId: string, status: string) => {
    setUserBooks(prev => prev.filter(b => !(b.book_id === bookId && b.status === status)))
  }

  const updateOptimistic = (bookId: string, updates: Partial<UserBook>) => {
    setUserBooks(prev => prev.map(b =>
      b.book_id === bookId ? { ...b, ...updates } : b
    ))
  }

  const refresh = async () => {
    await loadUserBooks()
  }

  return (
    <UserBooksContext.Provider value={{ userBooks, loading, addOptimistic, removeOptimistic, updateOptimistic, refresh }}>
      {children}
    </UserBooksContext.Provider>
  )
}

export function useUserBooks() {
  const context = useContext(UserBooksContext)
  if (context === undefined) {
    throw new Error('useUserBooks must be used within a UserBooksProvider')
  }
  return context
}
