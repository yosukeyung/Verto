const IP_REGEX = /^[0-9a-fA-F:.]{2,45}$/

function sanitizeIpToken(raw: string | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  return IP_REGEX.test(trimmed) ? trimmed : null
}

/**
 * Extracts client IP preferring trusted platform headers over x-forwarded-for.
 */
export function getClientIpFromHeaders(headers: Headers): string {
  const vercelForwarded = headers.get('x-vercel-forwarded-for')
  if (vercelForwarded) {
    for (const part of vercelForwarded.split(',')) {
      const ip = sanitizeIpToken(part)
      if (ip) return ip
    }
  }

  const realIp = sanitizeIpToken(headers.get('x-real-ip') ?? undefined)
  if (realIp) {
    return realIp
  }

  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded.split(',')
    for (let i = parts.length - 1; i >= 0; i--) {
      const ip = sanitizeIpToken(parts[i])
      if (ip) return ip
    }
  }

  return 'unknown'
}
