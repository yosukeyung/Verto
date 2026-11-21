import { isStaticAvatarId, sanitizeAvatarStorageUrl } from '@/lib/url-validation'

export interface AvatarOption {
  id: string
  name: string
  src: string
}

export interface AvatarResolveOptions {
  allowBlob?: boolean
}

export const AVATARS: AvatarOption[] = [
  { id: 'love', name: 'Love', src: '/avatars/love.png' },
  { id: 'eat', name: 'Eat', src: '/avatars/eat.png' },
  { id: 'sleep', name: 'Sleep', src: '/avatars/sleep.png' },
  { id: 'angry', name: 'Angry', src: '/avatars/angry.png' },
  { id: 'cry', name: 'Cry', src: '/avatars/cry.png' },
  { id: 'study', name: 'Study', src: '/avatars/study.png' },
]

export type AvatarSourceInput =
  | string
  | {
      avatar_id?: string | null
      avatar_url?: string | null
      custom_avatar_url?: string | null
    }
  | null
  | undefined

export function isCustomAvatarUrl(
  value?: string | null,
  options?: AvatarResolveOptions
): boolean {
  return Boolean(sanitizeAvatarStorageUrl(value, options))
}

export function getAvatarOption(avatarId?: string | null): AvatarOption {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]
}

export function getAvatarSrc(
  input: AvatarSourceInput,
  options?: AvatarResolveOptions
): string {
  if (!input) return AVATARS[0].src

  if (typeof input === 'string') {
    const trimmed = input.trim()
    return sanitizeAvatarStorageUrl(trimmed, options) ?? getAvatarOption(trimmed).src
  }

  if (typeof input.avatar_id === 'string') {
    const trimmedId = input.avatar_id.trim()
    const validStorageFromId = sanitizeAvatarStorageUrl(trimmedId, options)
    if (validStorageFromId) {
      return validStorageFromId
    }
    if (isStaticAvatarId(trimmedId)) {
      return getAvatarOption(trimmedId).src
    }
  }

  const candidateUrl = input.custom_avatar_url || input.avatar_url
  const validCandidateUrl = sanitizeAvatarStorageUrl(candidateUrl, options)
  if (validCandidateUrl) {
    return validCandidateUrl
  }

  return AVATARS[0].src
}
