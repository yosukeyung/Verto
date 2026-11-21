export const TAG_LABEL_MAX_LENGTH = 50
export const DEFAULT_TAG_LABEL_PREFIX = 'Your Tag'

const DEFAULT_LABEL_PATTERN = /^your\s+tag\s+(\d+)$/i
const MAX_PARSED_INDEX = 100000

/**
 * Normalizes and validates a user-provided tag display name.
 * Collapses newlines/tabs into single spaces, trims whitespace, and enforces max length.
 */
export function sanitizeTagLabel(raw: unknown): string | null {
  if (typeof raw !== 'string') {
    return null
  }
  const cleaned = raw.replace(/[\r\n\t]+/g, ' ').trim()
  if (!cleaned || cleaned.length > TAG_LABEL_MAX_LENGTH) {
    return null
  }
  return cleaned
}

/**
 * Computes the next sequential default tag name ("Your Tag 1", "Your Tag 2", ...)
 * from a user's currently owned tag labels, resilient to unclaims and custom renames.
 */
export function getNextDefaultTagName(
  existingLabels: ReadonlyArray<string | null | undefined>
): string {
  let maxNumber = 0
  const usedLower = new Set<string>()

  for (const raw of existingLabels) {
    const cleaned = sanitizeTagLabel(raw)
    if (!cleaned) continue
    usedLower.add(cleaned.toLowerCase())

    const match = cleaned.match(DEFAULT_LABEL_PATTERN)
    if (match) {
      const parsed = Number.parseInt(match[1], 10)
      if (Number.isSafeInteger(parsed) && parsed > 0 && parsed < MAX_PARSED_INDEX) {
        if (parsed > maxNumber) {
          maxNumber = parsed
        }
      }
    }
  }

  let candidate = Math.max(maxNumber, existingLabels.length) + 1
  while (usedLower.has(`your tag ${candidate}`)) {
    candidate += 1
  }

  return `${DEFAULT_TAG_LABEL_PREFIX} ${candidate}`
}

/**
 * Resolves a human-friendly display name for a tag row, falling back cleanly for legacy rows.
 */
export function getTagDisplayName(
  tag: { label?: string | null; metadata?: Record<string, unknown> | null } | null | undefined,
  fallbackIndex = 0
): string {
  return (
    sanitizeTagLabel(tag?.label) ??
    sanitizeTagLabel(tag?.metadata?.label) ??
    `${DEFAULT_TAG_LABEL_PREFIX} ${fallbackIndex + 1}`
  )
}

/**
 * Formats internal active_mode enum values for user-facing labels.
 */
export function formatTagModeLabel(mode: string): string {
  switch (mode) {
    case 'social':
      return 'Social'
    case 'lost_and_found':
      return 'Lost & Found'
    case 'event_hub':
      return 'Event Hub'
    default:
      return mode
  }
}
