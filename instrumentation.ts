import * as Sentry from '@sentry/nextjs'
import { getSentryDsn } from '@/lib/sentry-scrub'

export async function register() {
  if (!getSentryDsn()) {
    return
  }

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('./sentry.server.config')
    } else if (process.env.NEXT_RUNTIME === 'edge') {
      await import('./sentry.edge.config')
    }
  } catch {
    // Gracefully no-op if runtime instrumentation cannot initialize
  }
}

export function onRequestError(
  ...args: Parameters<typeof Sentry.captureRequestError>
) {
  if (!getSentryDsn()) {
    return
  }

  try {
    return Sentry.captureRequestError(...args)
  } catch {
    return undefined
  }
}
