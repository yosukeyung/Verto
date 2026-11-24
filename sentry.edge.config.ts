import * as Sentry from '@sentry/nextjs'
import {
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
      tracesSampleRate: 0,
      beforeSend: scrubSentryEvent,
      beforeBreadcrumb: scrubSentryBreadcrumb,
    })
  } catch {
    // Keep Edge runtime / proxy non-blocking if Sentry initialization fails
  }
}
