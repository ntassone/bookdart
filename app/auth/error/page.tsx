import Link from 'next/link'
import { Button } from '@base-ui/react/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-6">
            There was a problem signing you in. Please try again.
          </p>
          <Link href="/auth/signin">
            <Button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
