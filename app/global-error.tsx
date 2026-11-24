'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { getSentryDsn } from '@/lib/sentry-scrub'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (!getSentryDsn()) return
    try {
      Sentry.captureException(error)
    } catch {
      // Never throw inside global error boundary
    }
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 font-sans antialiased flex items-center justify-center px-4">
        <main className="w-full max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Something went wrong
          </h1>
          <p className="text-sm text-gray-600">
            An unexpected error occurred. Please try loading this page again.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
