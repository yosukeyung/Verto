import * as Sentry from '@sentry/nextjs'
import {
  freeTierTracesSampler,
  getSentryDsn,
  scrubSentryBreadcrumb,
  scrubSentryEvent,
} from '@/lib/sentry-scrub'

const dsn = getSentryDsn()

if (dsn) {
  try {
    Sentry.init({
      dsn,
      enabled: true,
      tracesSampler: freeTierTracesSampler,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
      beforeSend: scrubSentryEvent,
      beforeBreadcrumb: scrubSentryBreadcrumb,
    })
  } catch {
    // Keep client rendering non-blocking if Sentry initialization fails
  }
}

export function onRouterTransitionStart(
  ...args: Parameters<typeof Sentry.captureRouterTransitionStart>
) {
  if (!getSentryDsn()) return
  try {
    return Sentry.captureRouterTransitionStart(...args)
  } catch {
    return undefined
  }
}
