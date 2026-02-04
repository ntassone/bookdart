'use client'

import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import { Dialog } from '@base-ui/react/dialog'
import { checkUsernameAvailability, setUsername } from '@/lib/api/userProfile'
import LoadingIndicator from '@/components/LoadingIndicator'

interface UsernameModalProps {
  open: boolean
  onComplete: () => void
}

export default function UsernameModal({ open, onComplete }: UsernameModalProps) {
  const [username, setUsernameInput] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debounced username availability check
  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null)
      setError(null)
      return
    }

    // Validate format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      setIsAvailable(false)
      setError('Only letters, numbers, underscores, and hyphens allowed')
      return
    }

    if (username.length > 30) {
      setIsAvailable(false)
      setError('Username must be 30 characters or less')
      return
    }

    const timer = setTimeout(async () => {
      setIsChecking(true)
      setError(null)
      try {
        const available = await checkUsernameAvailability(username)
        setIsAvailable(available)
        if (!available) {
          setError('Username is already taken')
        }
      } catch (err) {
        console.error('Error checking username:', err)
        setError('Failed to check availability')
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAvailable || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      await setUsername(username)
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set username')
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-warm-text border border-white border-opacity-20 rounded-lg shadow-xl p-6 w-full max-w-md z-50">
          <Dialog.Title className="text-2xl font-bold text-white mb-2">
            Choose Your Username
          </Dialog.Title>
          <Dialog.Description className="text-sm text-white text-opacity-60 mb-6">
            Pick a unique username for your Bookdart profile. You can use letters, numbers, underscores, and hyphens.
          </Dialog.Description>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsernameInput(e.target.value.toLowerCase())}
                  placeholder="johndoe"
                  className="w-full px-4 py-2 border border-white border-opacity-30 rounded-lg bg-transparent text-white placeholder-white placeholder-opacity-40 focus:border-opacity-60 outline-none"
                  autoFocus
                  minLength={3}
                  maxLength={30}
                  required
                />
                {isChecking && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <LoadingIndicator size="sm" />
                  </div>
                )}
                {!isChecking && username.length >= 3 && isAvailable !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isAvailable ? (
                      <Check className="w-5 h-5 text-green-400" />
                    ) : (
                      <X className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                )}
              </div>
              {username.length >= 3 && (
                <p className={`mt-2 text-sm ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                  {error || (isAvailable && 'Username is available!')}
                </p>
              )}
              {username.length > 0 && username.length < 3 && (
                <p className="mt-2 text-sm text-white text-opacity-50">
                  Username must be at least 3 characters
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!isAvailable || isSubmitting}
                className="flex-1 px-4 py-2 bg-white text-warm-text rounded-lg hover:bg-opacity-90 transition-colors disabled:bg-white disabled:bg-opacity-30 disabled:cursor-not-allowed font-medium"
              >
                {isSubmitting ? 'Setting username...' : 'Continue'}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
