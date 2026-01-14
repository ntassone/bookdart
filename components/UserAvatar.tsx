'use client'

import { Avatar } from '@base-ui/react/avatar'
import { Menu } from '@base-ui/react/menu'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function UserAvatar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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
          <Menu.Popup className="bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] py-2 z-50">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm text-gray-600 truncate">{user.email}</p>
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
