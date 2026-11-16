export interface AvatarOption {
  id: string
  name: string
  src: string
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

export function isCustomAvatarUrl(value?: string | null): boolean {
  if (!value) return false
  const trimmed = value.trim()
  return /^(https?:\/\/|blob:)/i.test(trimmed)
}

export function getAvatarOption(avatarId?: string | null): AvatarOption {
  return AVATARS.find((a) => a.id === avatarId) ?? AVATARS[0]
}

export function getAvatarSrc(input: AvatarSourceInput): string {
  if (!input) return AVATARS[0].src

  if (typeof input === 'string') {
    const trimmed = input.trim()
    return isCustomAvatarUrl(trimmed) ? trimmed : getAvatarOption(trimmed).src
  }

  const candidateUrl = input.custom_avatar_url || input.avatar_url
  if (isCustomAvatarUrl(candidateUrl)) {
    return candidateUrl!.trim()
  }

  if (isCustomAvatarUrl(input.avatar_id)) {
    return input.avatar_id!.trim()
  }

  return getAvatarOption(input.avatar_id).src
}
