export const SUPPORT_CATEGORIES = [
  { value: 'tag_nfc', label: 'Tag / NFC' },
  { value: 'account_claim', label: 'Account & Claiming' },
  { value: 'dashboard_mode', label: 'Dashboard & Modes' },
  { value: 'other', label: 'Other' },
] as const

export type SupportCategoryValue = (typeof SUPPORT_CATEGORIES)[number]['value']

export const SUPPORT_DESCRIPTION_MIN = 10
export const SUPPORT_DESCRIPTION_MAX = 2000

const CATEGORY_MAP: Record<SupportCategoryValue, string> = {
  tag_nfc: 'Tag / NFC',
  account_claim: 'Account & Claiming',
  dashboard_mode: 'Dashboard & Modes',
  other: 'Other',
}

export function isSupportCategory(value: unknown): value is SupportCategoryValue {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(CATEGORY_MAP, value)
  )
}

export function getSupportCategoryLabel(value: SupportCategoryValue): string {
  return CATEGORY_MAP[value]
}

const ALLOWED_RETURN_PREFIXES = ['/login', '/register', '/dashboard'] as const

export function sanitizeReturnPath(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (
    !trimmed ||
    !trimmed.startsWith('/') ||
    trimmed.startsWith('//') ||
    trimmed.includes('\\') ||
    /[\u0000-\u001F\u007F]/.test(trimmed)
  ) {
    return null
  }

  try {
    const parsed = new URL(trimmed, 'http://localhost')
    if (parsed.origin !== 'http://localhost') {
      return null
    }

    const path = parsed.pathname
    if (path === '/support' || path.startsWith('/support/')) {
      return null
    }

    const isAllowed =
      path === '/' ||
      ALLOWED_RETURN_PREFIXES.some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`)
      )

    if (!isAllowed) {
      return null
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return null
  }
}
