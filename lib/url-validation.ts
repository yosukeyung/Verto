export const STATIC_AVATAR_IDS = [
  'love',
  'eat',
  'sleep',
  'angry',
  'cry',
  'study',
] as const

export type StaticAvatarId = (typeof STATIC_AVATAR_IDS)[number]

const CONTROL_CHAR_REGEX = /[\u0000-\u001F\u007F]/
const IG_HANDLE_REGEX = /^[A-Za-z0-9._]{1,30}$/

export interface AvatarValidationOptions {
  expectedUserId?: string
  allowBlob?: boolean
}

export function isStaticAvatarId(value: unknown): value is StaticAvatarId {
  return (
    typeof value === 'string' &&
    (STATIC_AVATAR_IDS as readonly string[]).includes(value)
  )
}

export function sanitizeAvatarStorageUrl(
  raw: unknown,
  options?: AvatarValidationOptions
): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || CONTROL_CHAR_REGEX.test(trimmed)) return null

  if (options?.allowBlob && /^blob:[^\s]+$/i.test(trimmed)) {
    return trimmed
  }

  const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!rawSupabaseUrl) return null

  try {
    const supabaseParsed = new URL(rawSupabaseUrl)
    const parsed = new URL(trimmed)

    if (parsed.protocol !== 'https:') return null
    if (parsed.username || parsed.password) return null
    if (parsed.origin !== supabaseParsed.origin) return null

    let decodedPath: string
    try {
      decodedPath = decodeURIComponent(parsed.pathname)
    } catch {
      return null
    }

    if (
      decodedPath.includes('..') ||
      decodedPath.includes('\\') ||
      CONTROL_CHAR_REGEX.test(decodedPath)
    ) {
      return null
    }

    const requiredPrefix = options?.expectedUserId
      ? `/storage/v1/object/public/avatars/${options.expectedUserId}/`
      : '/storage/v1/object/public/avatars/'

    if (
      !parsed.pathname.startsWith(requiredPrefix) ||
      !decodedPath.startsWith(requiredPrefix) ||
      decodedPath.length <= requiredPrefix.length
    ) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

export function sanitizeProfileAvatarId(
  raw: unknown,
  options?: AvatarValidationOptions
): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  if (isStaticAvatarId(trimmed)) {
    return trimmed
  }

  return sanitizeAvatarStorageUrl(trimmed, options)
}

export function sanitizeHttpsUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed || CONTROL_CHAR_REGEX.test(trimmed)) return null
  if (trimmed.startsWith('/') || trimmed.startsWith('\\') || trimmed.includes('\\')) {
    return null
  }

  let candidate = trimmed
  if (trimmed.includes(':')) {
    if (!/^https:\/\//i.test(trimmed)) {
      return null
    }
    const afterScheme = trimmed.slice('https://'.length)
    if (!afterScheme || afterScheme.startsWith('/') || afterScheme.startsWith('\\')) {
      return null
    }
  } else {
    candidate = `https://${trimmed}`
  }

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== 'https:') return null
    if (parsed.username || parsed.password) return null

    const host = parsed.hostname
    if (
      !host ||
      !host.includes('.') ||
      host.startsWith('.') ||
      host.endsWith('.')
    ) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

export function sanitizeLinkedInUrl(raw: unknown): string | null {
  const normalized = sanitizeHttpsUrl(raw)
  if (!normalized) return null

  try {
    const parsed = new URL(normalized)
    const host = parsed.hostname.toLowerCase()
    const isAllowed =
      host === 'linkedin.com' ||
      (host.endsWith('.linkedin.com') &&
        host.length > '.linkedin.com'.length &&
        !host.startsWith('.'))

    return isAllowed ? normalized : null
  } catch {
    return null
  }
}

export function sanitizeInstagramHandle(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().replace(/^@/, '')
  return IG_HANDLE_REGEX.test(normalized) ? normalized : null
}

export function buildInstagramUrl(raw: unknown): string | null {
  const handle = sanitizeInstagramHandle(raw)
  return handle ? `https://instagram.com/${handle}` : null
}
