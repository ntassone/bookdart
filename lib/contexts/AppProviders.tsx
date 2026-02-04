'use client'

import { ReactNode } from 'react'
import QueryProvider from './QueryProvider'
import { AuthProvider } from './AuthContext'
import { UserPreferencesProvider } from './UserPreferencesContext'
import { ReadBooksProvider } from './ReadBooksContext'
import { ToastProvider } from './ToastContext'
import { UsernameProvider } from './UsernameContext'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * Combined application providers wrapper
 * Consolidates all context providers in a single component
 * to improve organization and reduce nesting in layout
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <UserPreferencesProvider>
          <ReadBooksProvider>
            <UsernameProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </UsernameProvider>
          </ReadBooksProvider>
        </UserPreferencesProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
