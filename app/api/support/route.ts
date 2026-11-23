import { NextResponse } from 'next/server'
import {
  SUPPORT_DESCRIPTION_MAX,
  SUPPORT_DESCRIPTION_MIN,
  isSupportCategory,
} from '@/lib/support'

const MAX_BODY_BYTES = 16_384
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const MAX_TRACKED_KEYS = 500
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const FAILURE_MESSAGE = 'Failed to send email. Please try again tomorrow.'

const rateLimitStore = new Map<string, number[]>()

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const firstIp = forwarded.split(',')[0]?.trim()
    if (firstIp) return firstIp
  }
  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'unknown'
}

function checkRateLimit(clientKey: string, now: number): { allowed: boolean; retryAfterSec: number } {
  const cutoff = now - RATE_LIMIT_WINDOW_MS

  if (rateLimitStore.size > MAX_TRACKED_KEYS) {
    for (const [key, timestamps] of rateLimitStore.entries()) {
      const fresh = timestamps.filter((ts) => ts > cutoff)
      if (fresh.length === 0) {
        rateLimitStore.delete(key)
      } else {
        rateLimitStore.set(key, fresh)
      }
    }
  }

  const recent = (rateLimitStore.get(clientKey) ?? []).filter((ts) => ts > cutoff)
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = recent[0]
    const retryAfterSec = Math.max(1, Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000))
    rateLimitStore.set(clientKey, recent)
    return { allowed: false, retryAfterSec }
  }

  recent.push(now)
  rateLimitStore.set(clientKey, recent)
  return { allowed: true, retryAfterSec: 0 }
}

export async function POST(request: Request) {
  const contentLengthHeader = request.headers.get('content-length')
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader)
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: 'Request payload is too large.' },
        { status: 413 }
      )
    }
  }

  const clientIp = getClientIp(request)
  const { allowed, retryAfterSec } = checkRateLimit(clientIp, Date.now())
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many support requests. Please wait a few minutes and try again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      }
    )
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json(
      { error: 'Unable to read request body.' },
      { status: 400 }
    )
  }

  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: 'Request payload is too large.' },
      { status: 413 }
    )
  }

  let parsedBody: unknown
  try {
    parsedBody = JSON.parse(rawBody)
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON request body.' },
      { status: 400 }
    )
  }

  if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
    return NextResponse.json(
      { error: 'Invalid request payload.' },
      { status: 400 }
    )
  }

  const body = parsedBody as Record<string, unknown>

  // Honeypot field: reject cleanly without dispatching email or showing false sent status
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return NextResponse.json({ error: FAILURE_MESSAGE }, { status: 503 })
  }

  const rawEmail = body.email
  const cleanEmail = typeof rawEmail === 'string' ? rawEmail.trim() : ''
  if (
    !cleanEmail ||
    cleanEmail.length > 254 ||
    /[\r\n]/.test(cleanEmail) ||
    !EMAIL_REGEX.test(cleanEmail)
  ) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    )
  }

  if (!isSupportCategory(body.category)) {
    return NextResponse.json(
      { error: 'Please select a valid issue category.' },
      { status: 400 }
    )
  }

  const rawDescription = body.description
  const cleanDescription =
    typeof rawDescription === 'string' ? rawDescription.trim() : ''
  if (cleanDescription.length < SUPPORT_DESCRIPTION_MIN) {
    return NextResponse.json(
      {
        error: `Please enter at least ${SUPPORT_DESCRIPTION_MIN} characters describing the issue.`,
      },
      { status: 400 }
    )
  }

  if (cleanDescription.length > SUPPORT_DESCRIPTION_MAX) {
    return NextResponse.json(
      {
        error: `Issue description must be ${SUPPORT_DESCRIPTION_MAX} characters or fewer.`,
      },
      { status: 400 }
    )
  }

  return NextResponse.json({ error: FAILURE_MESSAGE }, { status: 503 })
}
