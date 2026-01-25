'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // Data stays fresh for 5 minutes
        gcTime: 1000 * 60 * 30, // Unused cache kept for 30 minutes
        refetchOnWindowFocus: false, // Don't refetch on window focus
        retry: 1, // Retry failed requests once
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
