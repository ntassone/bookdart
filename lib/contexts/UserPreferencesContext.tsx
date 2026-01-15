'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserProfile, updateFadeCompletedBooks } from '@/lib/api/userProfile'

interface UserPreferencesContextType {
  fadeCompletedBooks: boolean
  setFadeCompletedBooks: (value: boolean) => Promise<void>
  loading: boolean
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined)

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [fadeCompletedBooks, setFadeCompletedBooksState] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadPreferences()
    } else {
      setFadeCompletedBooksState(false)
      setLoading(false)
    }
  }, [user])

  const loadPreferences = async () => {
    setLoading(true)
    try {
      const profile = await getUserProfile()
      if (profile) {
        setFadeCompletedBooksState(profile.fade_completed_books)
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const setFadeCompletedBooks = async (value: boolean) => {
    setFadeCompletedBooksState(value)
    try {
      await updateFadeCompletedBooks(value)
    } catch (error) {
      console.error('Failed to update fade setting:', error)
      // Revert on error
      setFadeCompletedBooksState(!value)
      throw error
    }
  }

  return (
    <UserPreferencesContext.Provider value={{ fadeCompletedBooks, setFadeCompletedBooks, loading }}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider')
  }
  return context
}
