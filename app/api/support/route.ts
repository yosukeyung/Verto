import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  SUPPORT_DESCRIPTION_MAX,
  SUPPORT_DESCRIPTION_MIN,
  getSupportCategoryLabel,
  isSupportCategory,
} from '@/lib/support'
import {
  SUPPORT_DEVICE_COOKIE_NAME,
  isValidSupportDeviceId,
  peekSupportRateLimit,
  recordSupportRateLimit,
  resolveRateLimitKeys,
} from '@/lib/support-rate-limit'

const MAX_BODY_BYTES = 16_384
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DEFAULT_RESEND_FROM = 'Verto Support <onboarding@resend.dev>'
const RATE_LIMIT_ERROR_MESSAGE =
  'You have reached the limit of 2 reports per 5 hours. Please try again later. (Batas 2 laporan per 5 jam tercapai, silakan coba lagi nanti.)'

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

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

async function resolveOptionalUserId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data?.user?.id ?? null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
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

  // Honeypot trap: accept silently without calling Resend or burning quota.
  if (typeof body.website === 'string' && body.website.trim().length > 0) {
    return NextResponse.json({ success: true }, { status: 200 })
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

  const userId = await resolveOptionalUserId()
  const rawDeviceCookie = request.cookies.get(SUPPORT_DEVICE_COOKIE_NAME)?.value
  const existingDeviceId = isValidSupportDeviceId(rawDeviceCookie)
    ? rawDeviceCookie
    : null
  const deviceId = existingDeviceId ?? globalThis.crypto.randomUUID()
  const clientIp = getClientIp(request)

  const { checkKeys, recordKeys } = resolveRateLimitKeys({
    userId,
    existingDeviceId,
    deviceId,
    clientIp,
  })

  const { allowed, retryAfterSec } = peekSupportRateLimit(checkKeys)
  if (!allowed) {
    return NextResponse.json(
      { error: RATE_LIMIT_ERROR_MESSAGE },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      }
    )
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  const supportToEmail = process.env.SUPPORT_TO_EMAIL?.trim()
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM

  if (
    !resendApiKey ||
    !supportToEmail ||
    /[\r\n]/.test(supportToEmail) ||
    !EMAIL_REGEX.test(supportToEmail)
  ) {
    console.error('[Support API] Support email configuration is missing or invalid.')
    return NextResponse.json(
      { error: 'Support service is temporarily unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  const categoryLabel = getSupportCategoryLabel(body.category)
  const submittedAt = new Date().toISOString()

  const textLines = [
    'Verto Support Report',
    `Category: ${categoryLabel}`,
    `Reply-To Email: ${cleanEmail}`,
    `Submitted At: ${submittedAt}`,
    userId ? `Authenticated User ID: ${userId}` : 'Authenticated User ID: Guest',
    '',
    'Description:',
    cleanDescription,
  ]

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px;">Verto Support Report</h2>
      <p style="margin: 4px 0;"><strong>Category:</strong> ${escapeHtml(categoryLabel)}</p>
      <p style="margin: 4px 0;"><strong>Reply-To:</strong> ${escapeHtml(cleanEmail)}</p>
      <p style="margin: 4px 0;"><strong>Submitted At:</strong> ${escapeHtml(submittedAt)}</p>
      <p style="margin: 4px 0;"><strong>User ID:</strong> ${escapeHtml(userId ?? 'Guest')}</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
      <p style="margin: 0 0 8px;"><strong>Description:</strong></p>
      <pre style="white-space: pre-wrap; font-family: inherit; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">${escapeHtml(cleanDescription)}</pre>
    </div>
  `

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [supportToEmail],
        reply_to: cleanEmail,
        subject: `[Verto Support] ${categoryLabel}`,
        text: textLines.join('\n'),
        html,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!resendResponse.ok) {
      console.error('[Support API] Resend rejected email dispatch:', resendResponse.status)
      return NextResponse.json(
        { error: 'Could not send your report right now. Please try again later.' },
        { status: 502 }
      )
    }
  } catch (err) {
    console.error(
      '[Support API] Resend dispatch error:',
      err instanceof Error ? err.name : 'UnknownError'
    )
    return NextResponse.json(
      { error: 'Could not send your report right now. Please try again later.' },
      { status: 502 }
    )
  }

  recordSupportRateLimit(recordKeys)

  const response = NextResponse.json({ success: true }, { status: 200 })
  response.cookies.set(SUPPORT_DEVICE_COOKIE_NAME, deviceId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/support',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
