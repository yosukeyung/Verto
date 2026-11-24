export const ACTION_RATE_LIMIT_MAX_KEYS = 2000

export interface ActionRateLimitRule {
  key: string
  windowMs: number
  maxRequests: number
}

interface StoredBucket {
  timestamps: number[]
  maxWindowMs: number
}

const actionRateLimitStore = new Map<string, StoredBucket>()

function enforceCap(now: number, protectedKeys: Set<string>) {
  if (actionRateLimitStore.size <= ACTION_RATE_LIMIT_MAX_KEYS) {
    return
  }

  for (const [key, bucket] of actionRateLimitStore.entries()) {
    const cutoff = now - bucket.maxWindowMs
    const fresh = bucket.timestamps.filter((ts) => ts > cutoff)
    if (fresh.length === 0) {
      actionRateLimitStore.delete(key)
    } else {
      bucket.timestamps = fresh
    }
  }

  if (actionRateLimitStore.size <= ACTION_RATE_LIMIT_MAX_KEYS) {
    return
  }

  for (const key of actionRateLimitStore.keys()) {
    if (actionRateLimitStore.size <= ACTION_RATE_LIMIT_MAX_KEYS) {
      break
    }
    if (!protectedKeys.has(key)) {
      actionRateLimitStore.delete(key)
    }
  }
}

/**
 * Atomically verifies all rate-limit rules and records one attempt only if every rule allows it.
 */
export function consumeActionRateLimit(
  checks: ReadonlyArray<ActionRateLimitRule>,
  now = Date.now()
): { allowed: boolean; retryAfterSec: number } {
  let longestWaitSec = 0
  const prepared = new Map<string, StoredBucket>()

  for (const rule of checks) {
    const existing = actionRateLimitStore.get(rule.key)
    const maxWindowMs = Math.max(rule.windowMs, existing?.maxWindowMs ?? 0)
    const ruleCutoff = now - rule.windowMs
    const pruneCutoff = now - maxWindowMs

    const freshForPrune = (existing?.timestamps ?? []).filter((ts) => ts > pruneCutoff)
    const activeInRuleWindow = freshForPrune.filter((ts) => ts > ruleCutoff)

    if (activeInRuleWindow.length >= rule.maxRequests) {
      const oldest = activeInRuleWindow[0]
      const waitSec = Math.max(1, Math.ceil((oldest + rule.windowMs - now) / 1000))
      if (waitSec > longestWaitSec) {
        longestWaitSec = waitSec
      }
    }

    prepared.set(rule.key, { timestamps: freshForPrune, maxWindowMs })
  }

  if (longestWaitSec > 0) {
    return { allowed: false, retryAfterSec: longestWaitSec }
  }

  const protectedKeys = new Set<string>()
  for (const [key, bucket] of prepared.entries()) {
    bucket.timestamps.push(now)
    actionRateLimitStore.delete(key)
    actionRateLimitStore.set(key, bucket)
    protectedKeys.add(key)
  }

  enforceCap(now, protectedKeys)

  return { allowed: true, retryAfterSec: 0 }
}

export function getActionRateLimitStoreSize(): number {
  return actionRateLimitStore.size
}

export function resetActionRateLimitStore(): void {
  actionRateLimitStore.clear()
}
