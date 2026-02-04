'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useToast } from '@/lib/contexts/ToastContext'
import { createClient } from '@/lib/supabase/client'

// Test accounts - must match seed.sql
const TEST_ACCOUNTS = [
  { email: 'newuser@test.local', label: 'New User', description: 'Empty account' },
  { email: 'reader@test.local', label: 'Reader', description: '~20 books' },
  { email: 'collector@test.local', label: 'Collector', description: '100+ books' },
]

const TEST_PASSWORD = 'password123'

export default function DevAccountSwitcher() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const { addToast } = useToast()

  // Only show in local development
  const isLocalDev =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('127.0.0.1') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')

  if (!isLocalDev) return null

  const handleSwitch = async (email: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Sign out current user
      await supabase.auth.signOut()

      // Sign in as selected test account
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: TEST_PASSWORD,
      })

      if (error) {
        addToast(`Failed to switch: ${error.message}`, 'error')
        return
      }

      addToast(`Switched to ${email}`, 'success')
      setIsOpen(false)

      // Reload to refresh all contexts with new user data
      window.location.reload()
    } catch (err) {
      addToast('Failed to switch account', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const currentEmail = user?.email

  return (
    <div className="fixed bottom-4 left-4 z-[9999]">
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: '#7c3aed' }}
        title="Dev Account Switcher"
      >
        DEV
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute bottom-12 left-0 w-64 rounded-md shadow-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider"
            style={{
              backgroundColor: '#7c3aed',
              color: 'white',
            }}
          >
            Dev Account Switcher
          </div>

          {currentEmail && (
            <div className="px-3 py-2 border-b border-warm-border">
              <p className="text-xs text-warm-text-secondary">Current:</p>
              <p className="text-sm text-warm-text truncate">{currentEmail}</p>
            </div>
          )}

          <div className="py-1">
            {TEST_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                onClick={() => handleSwitch(account.email)}
                disabled={isLoading || account.email === currentEmail}
                className="w-full px-3 py-2 text-left hover:bg-warm-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <p className="text-sm text-warm-text font-medium">{account.label}</p>
                <p className="text-xs text-warm-text-secondary">
                  {account.description} &middot; {account.email}
                </p>
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="px-3 py-2 border-t border-warm-border">
              <p className="text-xs text-warm-text-secondary">Switching...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
