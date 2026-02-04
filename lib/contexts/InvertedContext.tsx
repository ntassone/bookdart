'use client'

import { createContext, useContext, ReactNode } from 'react'

interface InvertedContextValue {
  inverted: boolean
}

const InvertedContext = createContext<InvertedContextValue>({ inverted: false })

export function useInverted() {
  return useContext(InvertedContext)
}

interface InvertedProviderProps {
  inverted: boolean
  children: ReactNode
}

/**
 * Provider for inverted color styling
 * When inverted=true, components use light text on dark backgrounds
 * Automatically applies to nested components like menus and tooltips
 */
export function InvertedProvider({ inverted, children }: InvertedProviderProps) {
  return (
    <InvertedContext.Provider value={{ inverted }}>
      {children}
    </InvertedContext.Provider>
  )
}
