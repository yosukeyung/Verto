export const RESERVED_ADMIN_TAG_ID = '000'

/**
 * Unified tag_id format: 1..64 URL-safe characters.
 * Accepts UUIDs (36 chars), 16-byte base64url tokens (22 chars), 16/32-byte hex tokens (32/64 chars),
 * and legacy short alphanumeric/slug IDs without numeric-only or fixed-length assumptions.
 */
export const TAG_ID_REGEX = /^[a-zA-Z0-9_-]{1,64}$/

const BASE64URL_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

export type RandomTagIdFormat = 'base64url' | 'hex' | 'uuid'

/**
 * Trims a raw untrusted tag_id and returns it only if valid under TAG_ID_REGEX.
 */
export function normalizeTagId(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null
  }
  const trimmed = raw.trim()
  return TAG_ID_REGEX.test(trimmed) ? trimmed : null
}

/**
 * Strict exact-match validation (no leading/trailing whitespace) for API bodies and mutations.
 */
export function isValidTagId(raw: unknown): raw is string {
  return typeof raw === 'string' && TAG_ID_REGEX.test(raw)
}

export function isReservedTagId(tagId: string): boolean {
  return tagId.trim() === RESERVED_ADMIN_TAG_ID
}

export function isClaimableTagIdFormat(raw: unknown): boolean {
  const normalized = normalizeTagId(raw)
  return normalized !== null && !isReservedTagId(normalized)
}

function toBase64Url(bytes: Uint8Array): string {
  let result = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const hasB1 = i + 1 < bytes.length
    const hasB2 = i + 2 < bytes.length
    const b1 = hasB1 ? bytes[i + 1] : 0
    const b2 = hasB2 ? bytes[i + 2] : 0

    result += BASE64URL_ALPHABET[b0 >> 2]
    result += BASE64URL_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)]
    if (hasB1) {
      result += BASE64URL_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)]
    }
    if (hasB2) {
      result += BASE64URL_ALPHABET[b2 & 0x3f]
    }
  }
  return result
}

/**
 * Generates a cryptographically random, URL-safe tag ID compatible with TAG_ID_REGEX.
 * Uses Web Crypto API so it works safely in Edge Middleware, Node Server Actions, and browsers.
 */
export function generateRandomTagId(
  format: RandomTagIdFormat = 'base64url',
  byteLength = 16
): string {
  const webCrypto = globalThis.crypto
  if (!webCrypto || typeof webCrypto.getRandomValues !== 'function') {
    throw new Error('Cryptographically secure random generator is unavailable.')
  }

  const safeBytes = Math.min(32, Math.max(8, Math.floor(byteLength)))

  for (let attempt = 0; attempt < 4; attempt++) {
    let candidate: string
    if (format === 'uuid') {
      if (typeof webCrypto.randomUUID === 'function') {
        candidate = webCrypto.randomUUID()
      } else {
        const bytes = new Uint8Array(16)
        webCrypto.getRandomValues(bytes)
        bytes[6] = (bytes[6] & 0x0f) | 0x40
        bytes[8] = (bytes[8] & 0x3f) | 0x80
        const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
        candidate = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
      }
    } else {
      const bytes = new Uint8Array(safeBytes)
      webCrypto.getRandomValues(bytes)
      candidate =
        format === 'hex'
          ? Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
          : toBase64Url(bytes)
    }

    if (TAG_ID_REGEX.test(candidate) && !isReservedTagId(candidate)) {
      return candidate
    }
  }

  throw new Error('Failed to generate a valid random tag ID.')
}
