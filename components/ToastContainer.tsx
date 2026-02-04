'use client'

import * as React from 'react'
import { useToast } from '@/lib/contexts/ToastContext'

function ToastItem({ toast, onRemove }: { toast: { id: string; message: string; type: 'success' | 'error' | 'info' }; onRemove: (id: string) => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, 3000)

    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div
      className={`
        min-w-[240px] max-w-[360px] px-2 py-2
        bg-white border shadow-lg
        flex items-center justify-between gap-2
        pointer-events-auto
        animate-in slide-in-from-right duration-200
        ${
          toast.type === 'success'
            ? 'border-neutral-600'
            : toast.type === 'error'
            ? 'border-red-600'
            : 'border-neutral-400'
        }
      `}
    >
      <div className="flex items-center gap-2 flex-1">
        {toast.type === 'success' && (
          <svg
            className="w-4 h-4 text-neutral-700 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
        {toast.type === 'error' && (
          <svg
            className="w-4 h-4 text-red-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        {toast.type === 'info' && (
          <svg
            className="w-4 h-4 text-neutral-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        <p className="text-xs text-neutral-700 font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="p-0.5 hover:bg-neutral-100 transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <svg
          className="w-3 h-3 text-neutral-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
