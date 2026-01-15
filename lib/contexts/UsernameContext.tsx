'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserProfile } from '@/lib/api/userProfile'
import UsernameModal from '@/components/UsernameModal'

interface UsernameContextType {
  needsUsername: boolean
  isChecking: boolean
  refreshUsername: () => Promise<void>
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined)

export function UsernameProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [needsUsername, setNeedsUsername] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const checkUsername = async () => {
    if (!user) {
      setIsChecking(false)
      setNeedsUsername(false)
      setShowModal(false)
      return
    }

    try {
      const profile = await getUserProfile()
      const needs = profile !== null && !profile.username
      setNeedsUsername(needs)
      setShowModal(needs)
    } catch (error) {
      console.error('Error checking username:', error)
      setNeedsUsername(false)
      setShowModal(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      checkUsername()
    }
  }, [user, authLoading])

  const refreshUsername = async () => {
    await checkUsername()
  }

  const handleComplete = () => {
    setShowModal(false)
    setNeedsUsername(false)
    // Refresh the page to update navigation and other components
    window.location.reload()
  }

  return (
    <UsernameContext.Provider value={{ needsUsername, isChecking, refreshUsername }}>
      {children}
      <UsernameModal open={showModal} onComplete={handleComplete} />
    </UsernameContext.Provider>
  )
}

export function useUsername() {
  const context = useContext(UsernameContext)
  if (context === undefined) {
    throw new Error('useUsername must be used within a UsernameProvider')
  }
  return context
}
