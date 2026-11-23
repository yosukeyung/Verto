export const SUPPORT_RATE_LIMIT_NAMESPACE = 'support_rl_v2'
export const SUPPORT_RATE_LIMIT_WINDOW_MS = 5 * 60 * 60 * 1000
export const SUPPORT_RATE_LIMIT_MAX_REQUESTS = 2
export const SUPPORT_DEVICE_COOKIE_NAME = 'verto_support_did_v2'

const MAX_TRACKED_KEYS = 1000
const DEVICE_ID_REGEX = /^[a-zA-Z0-9_-]{16,64}$/

const rateLimitStore = new Map<string, number[]>()

export function isValidSupportDeviceId(value: unknown): value is string {
  return typeof value === 'string' && DEVICE_ID_REGEX.test(value)
}

function pruneStore(cutoff: number) {
  if (rateLimitStore.size <= MAX_TRACKED_KEYS) {
    return
  }

  for (const [key, timestamps] of rateLimitStore.entries()) {
    const fresh = timestamps.filter((ts) => ts > cutoff)
    if (fresh.length === 0) {
      rateLimitStore.delete(key)
    } else {
      rateLimitStore.set(key, fresh)
    }
  }
}

export function resolveRateLimitKeys({
  userId,
  existingDeviceId,
  deviceId,
  clientIp,
}: {
  userId: string | null
  existingDeviceId: string | null
  deviceId: string
  clientIp: string
}): { checkKeys: string[]; recordKeys: string[] } {
  if (userId) {
    const userKey = `${SUPPORT_RATE_LIMIT_NAMESPACE}:user:${userId}`
    return { checkKeys: [userKey], recordKeys: [userKey] }
  }

  if (existingDeviceId) {
    const deviceKey = `${SUPPORT_RATE_LIMIT_NAMESPACE}:device:${existingDeviceId}`
    return { checkKeys: [deviceKey], recordKeys: [deviceKey] }
  }

  const deviceKey = `${SUPPORT_RATE_LIMIT_NAMESPACE}:device:${deviceId}`
  const ipKey = `${SUPPORT_RATE_LIMIT_NAMESPACE}:ip:${clientIp}`
  return { checkKeys: [ipKey], recordKeys: [deviceKey, ipKey] }
}

/**
 * Checks whether any key has reached the 2-per-5-hour cap without consuming quota.
 */
export function peekSupportRateLimit(
  keys: string[],
  now = Date.now()
): { allowed: boolean; retryAfterSec: number } {
  const cutoff = now - SUPPORT_RATE_LIMIT_WINDOW_MS
  pruneStore(cutoff)

  let longestWaitSec = 0

  for (const key of keys) {
    const recent = (rateLimitStore.get(key) ?? []).filter((ts) => ts > cutoff)
    if (recent.length === 0) {
      rateLimitStore.delete(key)
      continue
    }

    rateLimitStore.set(key, recent)

    if (recent.length >= SUPPORT_RATE_LIMIT_MAX_REQUESTS) {
      const oldest = recent[0]
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
    return { allowed: false, retryAfterSec: longestWaitSec }
  }

  return { allowed: true, retryAfterSec: 0 }
}

export function recordSupportRateLimit(keys: string[], now = Date.now()): void {
  const cutoff = now - SUPPORT_RATE_LIMIT_WINDOW_MS
  pruneStore(cutoff)

  for (const key of keys) {
    const recent = (rateLimitStore.get(key) ?? []).filter((ts) => ts > cutoff)
    recent.push(now)
    rateLimitStore.set(key, recent)
  }
}

export function resetSupportRateLimitStore(): void {
  rateLimitStore.clear()
}
