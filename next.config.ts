import { withSentryConfig } from '@sentry/nextjs/config'
import type { NextConfig } from 'next'

function parseOrigin(raw?: string): { httpOrigin: string; wsOrigin: string } | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null
    }
    const wsProtocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
    return {
      httpOrigin: parsed.origin,
      wsOrigin: `${wsProtocol}//${parsed.host}`,
    }
  } catch {
    return null
  }
}

function buildContentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV !== 'production'
  const supabaseOrigin = parseOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const sentryOrigin = parseOrigin(process.env.NEXT_PUBLIC_SENTRY_DSN)

  const scriptSources = ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])]
  const imgSources = [
    "'self'",
    'data:',
    'blob:',
    'https://*.supabase.co',
    ...(supabaseOrigin ? [supabaseOrigin.httpOrigin] : []),
  ]
  const connectSources = [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://*.ingest.sentry.io',
    'https://*.ingest.us.sentry.io',
    'https://*.ingest.de.sentry.io',
    ...(supabaseOrigin ? [supabaseOrigin.httpOrigin, supabaseOrigin.wsOrigin] : []),
    ...(sentryOrigin ? [sentryOrigin.httpOrigin] : []),
  ]

  const directives = [
    "default-src 'self'",
    `script-src ${Array.from(new Set(scriptSources)).join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${Array.from(new Set(imgSources)).join(' ')}`,
    "font-src 'self' data:",
    `connect-src ${Array.from(new Set(connectSources)).join(' ')}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(process.env.VERCEL === '1' ? ['upgrade-insecure-requests'] : []),
  ]

  return directives.join('; ')
}

const nextConfig: NextConfig = {
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
      },
      { key: 'Content-Security-Policy', value: buildContentSecurityPolicy() },
    ]

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

const hasAuthToken = Boolean(process.env.SENTRY_AUTH_TOKEN?.trim())

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: hasAuthToken
    ? { deleteSourcemapsAfterUpload: true }
    : { disable: true },
})
