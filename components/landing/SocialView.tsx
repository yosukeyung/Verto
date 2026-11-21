import React from 'react'
import { MessageCircle, ExternalLink } from 'lucide-react'
import type { SocialMetadata } from '@/types/database'
import { getAvatarSrc, isCustomAvatarUrl } from '@/lib/avatars'
import { resolveTagTheme } from '@/lib/tag-theme'
import {
  buildInstagramUrl,
  sanitizeLinkedInUrl,
  sanitizeProfileAvatarId,
} from '@/lib/url-validation'
import { AvatarWithLightbox } from '@/components/ui/AvatarWithLightbox'

export interface SocialViewProps {
  metadata: Partial<SocialMetadata> & Record<string, any>
  avatarId?: string | null
  className?: string
  isPreview?: boolean
}

function InstagramIcon({
  className = 'w-5 h-5',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon({
  className = 'w-5 h-5',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export function SocialView({ metadata, avatarId, className, isPreview = false }: SocialViewProps) {
  const { name, bio, wa, ig, linkedin } = metadata
  const { fontClass, accent, isDark } = resolveTagTheme(metadata)
  const effectiveColor = accent.hex

  const validatedAvatarInput =
    sanitizeProfileAvatarId(avatarId, { allowBlob: isPreview }) ??
    sanitizeProfileAvatarId(metadata.avatar_id, { allowBlob: isPreview }) ??
    sanitizeProfileAvatarId(metadata.avatar_url, { allowBlob: isPreview }) ??
    'love'
  const avatarSrc = getAvatarSrc(validatedAvatarInput, { allowBlob: isPreview })
  const isCustomAvatar = isCustomAvatarUrl(avatarSrc, { allowBlob: isPreview })
  const displayName = name?.trim() || (isPreview ? 'Your Full Name' : 'Verto User')
  const displayBio = bio?.trim() || (isPreview ? 'Add a brief bio or headline here' : '')

  // In live preview mode, provide realistic sample links if user has not entered any yet
  const showFallbackLinks = isPreview && !wa && !ig && !linkedin
  const effectiveWa = showFallbackLinks ? '628123456789' : wa
  const effectiveIg = showFallbackLinks ? 'username' : ig
  const effectiveLinkedin = showFallbackLinks ? 'https://linkedin.com/in/username' : linkedin

  const cleanWa = typeof effectiveWa === 'string' ? effectiveWa.replace(/[^0-9]/g, '') : ''
  const waUrl = cleanWa ? `https://wa.me/${cleanWa}` : null
  const igUrl = buildInstagramUrl(effectiveIg)
  const linkedinUrl = sanitizeLinkedInUrl(effectiveLinkedin)

  const socialLinks = [
    waUrl
      ? {
          key: 'wa',
          label: 'WhatsApp',
          href: waUrl,
          icon: (
            <MessageCircle
              className="w-5 h-5 shrink-0"
              strokeWidth={1.75}
              style={{ color: effectiveColor }}
            />
          ),
        }
      : null,
    igUrl
      ? {
          key: 'ig',
          label: 'Instagram',
          href: igUrl,
          icon: <InstagramIcon className="w-5 h-5 shrink-0" style={{ color: effectiveColor }} />,
        }
      : null,
    linkedinUrl
      ? {
          key: 'linkedin',
          label: 'LinkedIn',
          href: linkedinUrl,
          icon: <LinkedinIcon className="w-5 h-5 shrink-0" style={{ color: effectiveColor }} />,
        }
      : null,
  ].filter(Boolean) as { key: string; label: string; href: string; icon: React.ReactNode }[]

  return (
    <main
      className={`flex flex-col justify-between transition-colors duration-150 ${
        isDark ? 'bg-neutral-900 text-white' : 'bg-white text-gray-900'
      } ${
        isPreview ? 'pt-10 pb-6 px-4' : 'min-h-screen px-4 py-12'
      } ${className || ''} ${fontClass} ${isPreview ? 'pointer-events-none select-none' : ''}`}
      style={{ '--theme-accent': effectiveColor } as React.CSSProperties}
    >
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Personal Profile Header */}
        <div className="mb-8">
          <AvatarWithLightbox
            src={avatarSrc}
            alt={`${displayName} avatar`}
            isCustom={isCustomAvatar}
            interactive={!isPreview}
            className={`w-20 h-20 rounded-full border-2 mx-auto mb-4 overflow-hidden flex items-center justify-center ${
              isDark ? 'bg-neutral-800' : 'bg-gray-50'
            }`}
            style={{ borderColor: effectiveColor }}
          />

          <h1
            className={`text-2xl font-bold leading-tight break-words ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {displayName}
          </h1>

          {displayBio && (
            <p
              className={`mt-1.5 text-sm leading-relaxed max-w-xs mx-auto break-words ${
                isDark ? 'text-neutral-300' : 'text-gray-600'
              }`}
            >
              {displayBio}
            </p>
          )}

          <div
            className="w-8 h-0.5 mx-auto mt-3.5 rounded-full"
            style={{ backgroundColor: effectiveColor }}
          />
        </div>

        {/* Links Stack */}
        {socialLinks.length > 0 && (
          <div className="space-y-3 w-full">
            {socialLinks.map((item) => (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full h-11 px-5 rounded-lg border text-sm font-medium transition-colors duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  isDark
                    ? 'border-neutral-800 bg-neutral-900/80 text-white hover:bg-neutral-800 focus-visible:outline-white'
                    : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-gray-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
                <ExternalLink
                  className={`w-4 h-4 shrink-0 ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}
                  strokeWidth={1.75}
                />
              </a>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center pt-8">
        <p className={`text-xs tracking-wide ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
