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
      beforeSend: scrubSentryEvent,
      beforeBreadcrumb: scrubSentryBreadcrumb,
    })
  } catch {
    // Keep server runtime non-blocking if Sentry initialization fails
  }
}
