'use client'

import { useToast } from '@/lib/contexts/ToastContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            min-w-[300px] max-w-[400px] px-4 py-3
            bg-white border shadow-lg
            animate-in slide-in-from-right-full duration-300
            flex items-center justify-between gap-3
            ${
              toast.type === 'success'
                ? 'border-gray-600'
                : toast.type === 'error'
                ? 'border-red-600'
                : 'border-gray-400'
            }
          `}
          style={{
            willChange: 'transform',
            transform: 'translateZ(0)',
            contain: 'layout style paint'
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            {toast.type === 'success' && (
              <svg
                className="w-5 h-5 text-gray-700 flex-shrink-0"
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
                className="w-5 h-5 text-red-600 flex-shrink-0"
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
                className="w-5 h-5 text-gray-600 flex-shrink-0"
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
            <p className="text-sm text-gray-700 font-medium">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <svg
              className="w-4 h-4 text-gray-600"
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
      ))}
    </div>
  )
}
