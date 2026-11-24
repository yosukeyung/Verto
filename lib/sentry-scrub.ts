const SENSITIVE_KEY_PATTERN =
  /pass(word)?|secret|token|cookie|auth|api[_-]?key|service[_-]?role|resend|email|phone|whatsapp|wa_number|address/i

const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-forwarded-for',
  'x-real-ip',
  'apikey',
  'x-api-key',
  'x-supabase-auth',
])

const SENSITIVE_QUERY_KEYS = new Set([
  'token',
  'access_token',
  'refresh_token',
  'code',
  'email',
  'password',
  'key',
  'secret',
  'apikey',
])

const RESEND_KEY_REGEX = /\bre_[A-Za-z0-9_]{16,}\b/g
const JWT_REGEX = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g
const BEARER_REGEX = /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g

const MAX_SCRUB_DEPTH = 6

export function getSentryDsn(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()
  return raw ? raw : undefined
}

export interface SentrySamplerContext {
  name?: string
  location?: { pathname?: string; href?: string }
  normalizedRequest?: { url?: string }
  attributes?: Record<string, unknown>
  request?: { url?: string }
}

function isTagOrStaticTarget(candidate: string): boolean {
  const lower = candidate.toLowerCase()
  return (
    /(?:^|[\s/])t(?:\/|$|\?)/.test(lower) ||
    lower.includes('/_next/') ||
    lower.includes('/favicon.ico') ||
    /\.(svg|png|jpg|jpeg|gif|webp|css|js|woff2?)(\?|$)/.test(lower)
  )
}

export function freeTierTracesSampler(samplingContext: SentrySamplerContext): number {
  const attrs = samplingContext.attributes
  const candidates = [
    samplingContext.name,
    samplingContext.location?.pathname,
    samplingContext.location?.href,
    samplingContext.normalizedRequest?.url,
    samplingContext.request?.url,
    typeof attrs?.['http.target'] === 'string' ? attrs['http.target'] : undefined,
    typeof attrs?.['url.path'] === 'string' ? attrs['url.path'] : undefined,
    typeof attrs?.['http.route'] === 'string' ? attrs['http.route'] : undefined,
    typeof attrs?.['url.full'] === 'string' ? attrs['url.full'] : undefined,
  ]

  for (const candidate of candidates) {
    if (candidate && isTagOrStaticTarget(candidate)) {
      return 0
    }
  }

  return 0.05
}

function getRuntimeSecrets(): string[] {
  if (typeof process === 'undefined' || !process.env) {
    return []
  }

  const secrets: string[] = []
  for (const key of ['SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY'] as const) {
    const val = process.env[key]?.trim()
    if (val && val.length >= 8) {
      secrets.push(val)
    }
  }
  return secrets
}

export function scrubString(value: string): string {
  let out = value

  for (const secret of getRuntimeSecrets()) {
    if (out.includes(secret)) {
      out = out.split(secret).join('[Filtered:SECRET]')
    }
  }

  out = out
    .replace(RESEND_KEY_REGEX, '[Filtered:RESEND_KEY]')
    .replace(JWT_REGEX, '[Filtered:JWT]')
    .replace(BEARER_REGEX, 'Bearer [Filtered]')
    .replace(EMAIL_REGEX, '[Filtered:EMAIL]')

  return out
}

function scrubQueryUrl(rawUrl: string): string {
  const scrubbed = scrubString(rawUrl)
  const qIndex = scrubbed.indexOf('?')
  if (qIndex === -1) {
    return scrubbed
  }

  try {
    const parsed = new URL(
      scrubbed.startsWith('http://') || scrubbed.startsWith('https://')
        ? scrubbed
        : `https://placeholder.local${scrubbed.startsWith('/') ? '' : '/'}${scrubbed}`
    )

    for (const key of [...parsed.searchParams.keys()]) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase()) || SENSITIVE_KEY_PATTERN.test(key)) {
        parsed.searchParams.set(key, '[Filtered]')
      } else {
        parsed.searchParams.set(key, scrubString(parsed.searchParams.get(key) ?? ''))
      }
    }

    if (scrubbed.startsWith('http://') || scrubbed.startsWith('https://')) {
      return parsed.toString()
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return scrubbed.slice(0, qIndex) + '?[Filtered]'
  }
}

function scrubQueryString(query: string): string {
  try {
    const params = new URLSearchParams(query.startsWith('?') ? query.slice(1) : query)
    for (const key of [...params.keys()]) {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase()) || SENSITIVE_KEY_PATTERN.test(key)) {
        params.set(key, '[Filtered]')
      } else {
        params.set(key, scrubString(params.get(key) ?? ''))
      }
    }
    return params.toString()
  } catch {
    return '[Filtered]'
  }
}

function scrubValue(
  input: unknown,
  depth = 0,
  seen = new WeakSet<object>()
): unknown {
  if (typeof input === 'string') {
    return scrubString(input)
  }

  if (input === null || typeof input !== 'object') {
    return input
  }

  if (depth >= MAX_SCRUB_DEPTH || seen.has(input)) {
    return '[Truncated]'
  }
  seen.add(input)

  if (Array.isArray(input)) {
    return input.map((item) => scrubValue(item, depth + 1, seen))
  }

  const record = input as Record<string, unknown>
  const output: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(record)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      output[key] = '[Filtered]'
    } else {
      output[key] = scrubValue(val, depth + 1, seen)
    }
  }

  return output
}

export function scrubSentryBreadcrumb<T>(breadcrumb: T): T | null {
  try {
    if (!breadcrumb || typeof breadcrumb !== 'object') {
      return breadcrumb
    }

    const clone: Record<string, unknown> = { ...(breadcrumb as Record<string, unknown>) }

    if (typeof clone.message === 'string') {
      clone.message = scrubString(clone.message)
    }

    if (clone.data && typeof clone.data === 'object') {
      const dataClone = { ...(clone.data as Record<string, unknown>) }
      if (typeof dataClone.url === 'string') {
        dataClone.url = scrubQueryUrl(dataClone.url)
      }
      if (typeof dataClone.from === 'string') {
        dataClone.from = scrubQueryUrl(dataClone.from)
      }
      if (typeof dataClone.to === 'string') {
        dataClone.to = scrubQueryUrl(dataClone.to)
      }
      if (dataClone.headers && typeof dataClone.headers === 'object') {
        const headersOut: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(dataClone.headers as Record<string, unknown>)) {
          headersOut[k] = SENSITIVE_HEADER_KEYS.has(k.toLowerCase())
            ? '[Filtered]'
            : scrubValue(v)
        }
        dataClone.headers = headersOut
      }
      clone.data = scrubValue(dataClone)
    }

    return clone as T
  } catch {
    return null
  }
}

export function scrubSentryEvent<T>(event: T): T | null {
  try {
    if (!event || typeof event !== 'object') {
      return event
    }

    const clone: Record<string, unknown> = { ...(event as Record<string, unknown>) }

    if (typeof clone.message === 'string') {
      clone.message = scrubString(clone.message)
    }

    // Strip user PII, keeping only non-email opaque ID if present.
    if (clone.user && typeof clone.user === 'object') {
      const userObj = clone.user as Record<string, unknown>
      const safeId =
        typeof userObj.id === 'string' && !EMAIL_REGEX.test(userObj.id)
          ? userObj.id
          : undefined

      if (safeId) {
        clone.user = { id: safeId }
      } else {
        delete clone.user
      }
    }

    // Strip cookies, sensitive headers, and sensitive query parameters from request.
    if (clone.request && typeof clone.request === 'object') {
      const reqClone = { ...(clone.request as Record<string, unknown>) }
      delete reqClone.cookies

      if (reqClone.headers && typeof reqClone.headers === 'object') {
        const safeHeaders: Record<string, unknown> = {}
        for (const [k, v] of Object.entries(reqClone.headers as Record<string, unknown>)) {
          safeHeaders[k] = SENSITIVE_HEADER_KEYS.has(k.toLowerCase())
            ? '[Filtered]'
            : scrubValue(v)
        }
        reqClone.headers = safeHeaders
      }

      if (typeof reqClone.url === 'string') {
        reqClone.url = scrubQueryUrl(reqClone.url)
      }

      if (typeof reqClone.query_string === 'string') {
        reqClone.query_string = scrubQueryString(reqClone.query_string)
      } else if (reqClone.query_string && typeof reqClone.query_string === 'object') {
        reqClone.query_string = scrubValue(reqClone.query_string)
      }

      if ('data' in reqClone) {
        reqClone.data = scrubValue(reqClone.data)
      }

      clone.request = reqClone
    }

    if (clone.extra) {
      clone.extra = scrubValue(clone.extra)
    }
    if (clone.contexts) {
      clone.contexts = scrubValue(clone.contexts)
    }
    if (clone.tags) {
      clone.tags = scrubValue(clone.tags)
    }
    if (Array.isArray(clone.breadcrumbs)) {
      clone.breadcrumbs = clone.breadcrumbs
        .map((item) => scrubSentryBreadcrumb(item))
        .filter((item) => item !== null)
    }

    if (
      clone.exception &&
      typeof clone.exception === 'object' &&
      Array.isArray((clone.exception as { values?: unknown[] }).values)
    ) {
      const exObj = clone.exception as { values: unknown[] }
      clone.exception = {
        ...exObj,
        values: exObj.values.map((entry) => {
          if (!entry || typeof entry !== 'object') return entry
          const exEntry = entry as Record<string, unknown>
          return typeof exEntry.value === 'string'
            ? { ...exEntry, value: scrubString(exEntry.value) }
            : exEntry
        }),
      }
    }

    return clone as T
  } catch {
    return null
  }
}
