import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'

export const SUPPORT_RATE_LIMIT_NAMESPACE = 'support_rl_v2'
export const SUPPORT_RATE_LIMIT_WINDOW_MS = 5 * 60 * 60 * 1000
export const SUPPORT_RATE_LIMIT_MAX_REQUESTS = 2
export const SUPPORT_DEVICE_COOKIE_NAME = 'verto_support_did_v2'
export const SUPPORT_RATE_LIMIT_MAX_KEYS = 1000

const DEVICE_ID_REGEX = /^[a-zA-Z0-9_-]{16,64}$/
const SIGNATURE_REGEX = /^[A-Za-z0-9_-]{43}$/

interface RateLimitEntry {
  ts: number
  token: string
}

const rateLimitStore = new Map<string, RateLimitEntry[]>()
let fallbackProcessKey: Buffer | null = null

function getSigningKey(): Buffer {
  const dedicatedSecret = process.env.SUPPORT_COOKIE_SECRET?.trim()
  if (dedicatedSecret) {
    return createHash('sha256').update(dedicatedSecret).digest()
  }

  const serverEnvSecret =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.RESEND_API_KEY?.trim()
  if (serverEnvSecret) {
    return createHash('sha256')
      .update(`verto:support-did:v2:${serverEnvSecret}`)
      .digest()
  }

  if (!fallbackProcessKey) {
    fallbackProcessKey = randomBytes(32)
  }
  return fallbackProcessKey
}

export function isValidSupportDeviceId(value: unknown): value is string {
  return typeof value === 'string' && DEVICE_ID_REGEX.test(value)
}

export function signSupportDeviceId(deviceId: string): string {
  if (!isValidSupportDeviceId(deviceId)) {
    throw new Error('Invalid support device identifier.')
  }
  const signature = createHmac('sha256', getSigningKey())
    .update(deviceId)
    .digest('base64url')
  return `${deviceId}.${signature}`
}

export function verifySignedSupportDeviceCookie(rawCookie: unknown): string | null {
  if (typeof rawCookie !== 'string') {
    return null
  }

  const trimmed = rawCookie.trim()
  const dotIndex = trimmed.lastIndexOf('.')
  if (dotIndex <= 0) {
    return null
  }

  const deviceId = trimmed.slice(0, dotIndex)
  const providedSig = trimmed.slice(dotIndex + 1)
  if (!isValidSupportDeviceId(deviceId) || !SIGNATURE_REGEX.test(providedSig)) {
    return null
  }

  const expectedSig = createHmac('sha256', getSigningKey())
    .update(deviceId)
    .digest('base64url')

  const providedBuf = Buffer.from(providedSig, 'utf8')
  const expectedBuf = Buffer.from(expectedSig, 'utf8')
  if (providedBuf.length !== expectedBuf.length) {
    return null
  }

  return timingSafeEqual(providedBuf, expectedBuf) ? deviceId : null
}

function enforceStoreCap(cutoff: number, protectedKeys: Set<string>) {
  if (rateLimitStore.size <= SUPPORT_RATE_LIMIT_MAX_KEYS) {
    return
  }

  for (const [key, entries] of rateLimitStore.entries()) {
    const fresh = entries.filter((entry) => entry.ts > cutoff)
    if (fresh.length === 0) {
      rateLimitStore.delete(key)
    } else {
      rateLimitStore.set(key, fresh)
    }
  }

  if (rateLimitStore.size <= SUPPORT_RATE_LIMIT_MAX_KEYS) {
    return
  }

  for (const key of rateLimitStore.keys()) {
    if (rateLimitStore.size <= SUPPORT_RATE_LIMIT_MAX_KEYS) {
      break
    }
    if (!protectedKeys.has(key)) {
      rateLimitStore.delete(key)
    }
  }
}

export function resolveRateLimitKeys({
  userId,
  verifiedDeviceId,
  deviceId,
  clientIp,
}: {
  userId: string | null
  verifiedDeviceId: string | null
  deviceId: string
  clientIp: string
}): string[] {
  const ipKey = `${SUPPORT_RATE_LIMIT_NAMESPACE}:ip:${clientIp}`
  const identityKey = userId
    ? `${SUPPORT_RATE_LIMIT_NAMESPACE}:user:${userId}`
    : `${SUPPORT_RATE_LIMIT_NAMESPACE}:device:${verifiedDeviceId ?? deviceId}`

  return Array.from(new Set([identityKey, ipKey]))
}

/**
 * Atomically checks and reserves a quota slot across all keys before dispatching email.
 */
export function reserveSupportRateLimit(
  keys: string[],
  now = Date.now()
): { allowed: boolean; retryAfterSec: number; reservationToken: string | null } {
  const uniqueKeys = Array.from(new Set(keys))
  const cutoff = now - SUPPORT_RATE_LIMIT_WINDOW_MS

  let longestWaitSec = 0
  const activeByKey = new Map<string, RateLimitEntry[]>()

  for (const key of uniqueKeys) {
    const fresh = (rateLimitStore.get(key) ?? []).filter((entry) => entry.ts > cutoff)
    if (fresh.length === 0) {
      rateLimitStore.delete(key)
    } else {
      rateLimitStore.set(key, fresh)
    }

    activeByKey.set(key, fresh)

    if (fresh.length >= SUPPORT_RATE_LIMIT_MAX_REQUESTS) {
      const oldest = fresh[0].ts
      const waitSec = Math.max(
        1,
        Math.ceil((oldest + SUPPORT_RATE_LIMIT_WINDOW_MS - now) / 1000)
      )
      if (waitSec > longestWaitSec) {
        longestWaitSec = waitSec
      }
    }
  }

  if (longestWaitSec > 0) {
    return { allowed: false, retryAfterSec: longestWaitSec, reservationToken: null }
  }

  const reservationToken = randomUUID()
  for (const key of uniqueKeys) {
    const next = [...(activeByKey.get(key) ?? []), { ts: now, token: reservationToken }]
    // Refresh insertion order so active keys are not evicted before older idle entries
    rateLimitStore.delete(key)
    rateLimitStore.set(key, next)
  }

  enforceStoreCap(cutoff, new Set(uniqueKeys))

  return { allowed: true, retryAfterSec: 0, reservationToken }
}

/**
 * Rolls back a slot reservation when email delivery fails due to transient errors.
 */
export function releaseSupportRateLimit(keys: string[], reservationToken: string): void {
  const uniqueKeys = Array.from(new Set(keys))
  for (const key of uniqueKeys) {
    const existing = rateLimitStore.get(key)
    if (!existing) continue

    const remaining = existing.filter((entry) => entry.token !== reservationToken)
    if (remaining.length === 0) {
      rateLimitStore.delete(key)
    } else {
      rateLimitStore.set(key, remaining)
    }
  }
}

export function getSupportRateLimitStoreSize(): number {
  return rateLimitStore.size
}

export function resetSupportRateLimitStore(): void {
  rateLimitStore.clear()
}
