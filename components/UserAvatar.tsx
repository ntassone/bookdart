'use client'

import { Avatar } from '@base-ui/react/avatar'
import { Menu } from '@base-ui/react/menu'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useUserPreferences } from '@/lib/contexts/UserPreferencesContext'
import { useToast } from '@/lib/contexts/ToastContext'

export default function UserAvatar() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { fadeCompletedBooks, setFadeCompletedBooks } = useUserPreferences()
  const { addToast } = useToast()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleToggleFade = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await setFadeCompletedBooks(!fadeCompletedBooks)
      addToast(
        fadeCompletedBooks ? 'Completed books will show normally' : 'Completed books will fade',
        'success'
      )
    } catch {
      addToast('Failed to update setting', 'error')
    }
  }

  if (!user) return null

  // Get initials from email (first two letters before @)
  const initials = user.email
    ? user.email.substring(0, 2).toUpperCase()
    : 'U'

  return (
    <Menu.Root>
      <Menu.Trigger className="cursor-pointer">
        <div className="w-10 h-10 bg-warm-border hover:bg-warm-text-tertiary transition-colors flex items-center justify-center">
          {user.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="User avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-warm-text font-semibold text-sm">{initials}</span>
          )}
        </div>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-[100]">
          <Menu.Popup
            className="min-w-[220px] py-2 rounded-sm"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
            }}
          >
            <div className="px-4 py-2 border-b border-warm-border">
              <p className="text-sm text-warm-text-secondary truncate">{user.email}</p>
            </div>

            {/* Settings Section */}
            <div className="py-2 border-b border-warm-border">
              <div className="px-4 py-1">
                <p className="text-xs font-semibold text-warm-text-secondary uppercase tracking-wider mb-2">
                  Settings
                </p>
              </div>
              <button
                className="w-full px-4 py-2 text-sm text-warm-text hover:bg-warm-bg cursor-pointer transition-colors outline-none flex items-center justify-between gap-3"
                onClick={handleToggleFade}
                type="button"
              >
                <span>Fade completed books</span>
                <div
                  className="relative w-9 h-5 rounded-full transition-colors flex items-center flex-shrink-0"
                  style={{
                    backgroundColor: fadeCompletedBooks ? 'var(--color-text-secondary)' : 'var(--color-border)'
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full shadow transition-transform transform"
                    style={{
                      backgroundColor: 'var(--color-bg-secondary)',
                      transform: fadeCompletedBooks ? 'translateX(1.125rem)' : 'translateX(0.125rem)'
                    }}
                  />
                </div>
              </button>
            </div>

            <Menu.Item
              className="px-4 py-2 text-sm text-warm-text hover:bg-warm-bg cursor-pointer transition-colors outline-none"
              onClick={handleSignOut}
            >
              Sign Out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
