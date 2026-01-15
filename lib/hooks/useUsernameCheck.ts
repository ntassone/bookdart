import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { getUserProfile } from '@/lib/api/userProfile'

export function useUsernameCheck() {
  const { user } = useAuth()
  const [needsUsername, setNeedsUsername] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    async function checkUsername() {
      if (!user) {
        setIsChecking(false)
        setNeedsUsername(false)
        return
      }

      try {
        const profile = await getUserProfile()
        setNeedsUsername(profile !== null && !profile.username)
      } catch (error) {
        console.error('Error checking username:', error)
        setNeedsUsername(false)
      } finally {
        setIsChecking(false)
      }
    }

    checkUsername()
  }, [user])

  return { needsUsername, isChecking }
}
