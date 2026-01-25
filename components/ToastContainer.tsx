'use client'

import { ToastProvider } from '@base-ui/react/toast/provider/ToastProvider'
import { ToastPortal } from '@base-ui/react/toast/portal/ToastPortal'
import { ToastViewport } from '@base-ui/react/toast/viewport/ToastViewport'
import { ToastRoot } from '@base-ui/react/toast/root/ToastRoot'
import { ToastPositioner } from '@base-ui/react/toast/positioner/ToastPositioner'
import { ToastClose } from '@base-ui/react/toast/close/ToastClose'
import { useToast } from '@/lib/contexts/ToastContext'

export default function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <ToastProvider duration={3000} animated={true} pauseOnHover={true} pauseOnPageIdle={true}>
      <ToastPortal>
        <ToastViewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
          {toasts.map((toast) => (
            <ToastRoot
              key={toast.id}
              open={true}
              onOpenChange={(open) => {
                if (!open) removeToast(toast.id)
              }}
            >
              <ToastPositioner>
                <div
                  className={`
                    min-w-[240px] max-w-[360px] px-2 py-2
                    bg-white border shadow-lg
                    flex items-center justify-between gap-2
                    ${
                      toast.type === 'success'
                        ? 'border-gray-600'
                        : toast.type === 'error'
                        ? 'border-red-600'
                        : 'border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 flex-1">
                    {toast.type === 'success' && (
                      <svg
                        className="w-4 h-4 text-gray-700 flex-shrink-0"
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
                        className="w-4 h-4 text-gray-600 flex-shrink-0"
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
                    <p className="text-xs text-gray-700 font-medium">{toast.message}</p>
                  </div>
                  <ToastClose className="p-0.5 hover:bg-gray-100 transition-colors flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-gray-600"
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
                  </ToastClose>
                </div>
              </ToastPositioner>
            </ToastRoot>
          ))}
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  )
}
