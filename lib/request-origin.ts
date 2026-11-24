function parseOriginValue(raw: string | null | undefined): string | null {
  const trimmed = raw?.trim()
  if (!trimmed || trimmed === 'null') {
    return null
  }

  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null
    }
    return parsed.origin
  } catch {
    return null
  }
}

function getAllowedOrigins(request: Request): Set<string> {
  const allowed = new Set<string>()

  const reqOrigin = parseOriginValue(request.url)
  if (reqOrigin) {
    allowed.add(reqOrigin)
  }

  const rawHost =
    request.headers.get('x-forwarded-host')?.split(',')[0]?.trim() ||
    request.headers.get('host')?.trim()

  if (rawHost && !/[/\\\s]/.test(rawHost)) {
    const rawProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
    const fallbackProto = reqOrigin?.startsWith('https://') ? 'https' : 'http'
    const proto = rawProto === 'https' || rawProto === 'http' ? rawProto : fallbackProto
    const headerOrigin = parseOriginValue(`${proto}://${rawHost}`)
    if (headerOrigin) {
      allowed.add(headerOrigin)
    }
  }

  const baseUrlOrigin = parseOriginValue(process.env.NEXT_PUBLIC_BASE_URL)
  if (baseUrlOrigin) {
    allowed.add(baseUrlOrigin)
  }

  const vercelHost = process.env.VERCEL_URL?.trim()
  if (vercelHost) {
    const vercelOrigin = parseOriginValue(`https://${vercelHost}`)
    if (vercelOrigin) {
      allowed.add(vercelOrigin)
    }
  }

  return allowed
}

/**
 * Verifies same-origin state-changing API requests as defense-in-depth alongside SameSite cookies.
 */
export function isTrustedRequestOrigin(request: Request): boolean {
  const allowedOrigins = getAllowedOrigins(request)
  if (allowedOrigins.size === 0) {
    return false
  }

  const originHeader = request.headers.get('origin')
  if (originHeader !== null) {
    const parsedOrigin = parseOriginValue(originHeader)
    return parsedOrigin !== null && allowedOrigins.has(parsedOrigin)
  }

  const secFetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase()
  if (secFetchSite && secFetchSite !== 'same-origin' && secFetchSite !== 'none') {
    return false
  }

  const refererOrigin = parseOriginValue(request.headers.get('referer'))
  if (refererOrigin !== null) {
    return allowedOrigins.has(refererOrigin)
  }

  return false
}
