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
    } catch (error) {
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
        <Avatar.Root className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors">
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar.Root>
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" alignment="end" sideOffset={8}>
          <Menu.Popup className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[220px] py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
            </div>

            {/* Settings Section */}
            <div className="py-2 border-b border-gray-100">
              <div className="px-4 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Settings
                </p>
              </div>
              <button
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors outline-none flex items-center justify-between"
                onClick={handleToggleFade}
                type="button"
              >
                <span>Fade completed books</span>
                <div className={`w-9 h-5 rounded-full transition-colors ${
                  fadeCompletedBooks ? 'bg-gray-600' : 'bg-gray-300'
                }`}>
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform transform ${
                    fadeCompletedBooks ? 'translate-x-4' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </button>
            </div>

            <Menu.Item
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors outline-none"
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
