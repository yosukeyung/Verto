import React from 'react'
import { MessageCircle, ExternalLink } from 'lucide-react'
import type { SocialMetadata, ThemeFont, ThemeColor } from '@/types/database'

export interface SocialViewProps {
  metadata: Partial<SocialMetadata> & Record<string, any>
  className?: string
  isPreview?: boolean
}

const FONT_MAP: Record<ThemeFont, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
}

interface ColorThemeConfig {
  hex: string
  underlineClass: string
  iconColorClass: string
  buttonHoverClass: string
  focusRingClass: string
}

const COLOR_MAP: Record<ThemeColor, ColorThemeConfig> = {
  orange: {
    hex: '#FF5C00',
    underlineClass: 'border-[#FF5C00]',
    iconColorClass: 'text-[#FF5C00]',
    buttonHoverClass: 'hover:border-[#FF5C00] hover:bg-[#FF5C00]/5',
    focusRingClass: 'focus-visible:outline-[#FF5C00]',
  },
  black: {
    hex: '#000000',
    underlineClass: 'border-black',
    iconColorClass: 'text-black',
    buttonHoverClass: 'hover:border-black hover:bg-black/5',
    focusRingClass: 'focus-visible:outline-black',
  },
  emerald: {
    hex: '#10B981',
    underlineClass: 'border-[#10B981]',
    iconColorClass: 'text-[#10B981]',
    buttonHoverClass: 'hover:border-[#10B981] hover:bg-[#10B981]/5',
    focusRingClass: 'focus-visible:outline-[#10B981]',
  },
  blue: {
    hex: '#3B82F6',
    underlineClass: 'border-[#3B82F6]',
    iconColorClass: 'text-[#3B82F6]',
    buttonHoverClass: 'hover:border-[#3B82F6] hover:bg-[#3B82F6]/5',
    focusRingClass: 'focus-visible:outline-[#3B82F6]',
  },
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

export function SocialView({ metadata, className, isPreview = false }: SocialViewProps) {
  const { name, bio, wa, ig, linkedin } = metadata

  // Parse theme settings with fallbacks
  const themeFontKey: ThemeFont = (metadata.theme_font as ThemeFont) || 'sans'
  const themeColorKey: ThemeColor = (metadata.theme_color as ThemeColor) || 'orange'

  const fontClass = FONT_MAP[themeFontKey] || FONT_MAP.sans
  const colorConfig = COLOR_MAP[themeColorKey] || COLOR_MAP.orange

  // In live preview mode, provide realistic sample links if user has not entered any yet
  const showFallbackLinks = isPreview && !wa && !ig && !linkedin
  const effectiveWa = showFallbackLinks ? '628123456789' : wa
  const effectiveIg = showFallbackLinks ? 'username' : ig
  const effectiveLinkedin = showFallbackLinks ? 'https://linkedin.com/in/username' : linkedin

  const waUrl = effectiveWa ? `https://wa.me/${effectiveWa.replace(/[^0-9]/g, '')}` : null
  const igUrl = effectiveIg ? `https://instagram.com/${effectiveIg.replace(/^@/, '')}` : null
  const linkedinUrl = effectiveLinkedin ? (effectiveLinkedin.startsWith('http') ? effectiveLinkedin : `https://${effectiveLinkedin}`) : null

  return (
    <main
      className={`bg-white flex flex-col justify-between ${
        className || 'min-h-screen px-4 py-12'
      } ${fontClass} ${isPreview ? 'pointer-events-none select-none' : ''}`}
      style={{ '--theme-accent': colorConfig.hex } as React.CSSProperties}
    >
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {name || (isPreview ? 'Your Full Name' : 'Verto User')}
          </h1>
          <div
            className={`w-8 border-b-2 ${colorConfig.underlineClass} mx-auto mt-2 mb-3`}
            style={{ borderColor: colorConfig.hex }}
          />
          {(bio || isPreview) && (
            <p className="text-base text-gray-500 leading-normal max-w-xs mx-auto">
              {bio || (isPreview ? 'Add a brief bio or headline here' : '')}
            </p>
          )}
        </div>

        {/* Links Stack */}
        <div className="space-y-3 w-full">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full h-11 px-5 rounded-lg border border-gray-200 ${colorConfig.buttonHoverClass} text-gray-900 text-sm font-medium transition-all duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 ${colorConfig.focusRingClass}`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle
                  className={`w-5 h-5 shrink-0 ${colorConfig.iconColorClass}`}
                  strokeWidth={1.75}
                  style={{ color: colorConfig.hex }}
                />
                <span>WhatsApp</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
            </a>
          )}

          {igUrl && (
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full h-11 px-5 rounded-lg border border-gray-200 ${colorConfig.buttonHoverClass} text-gray-900 text-sm font-medium transition-all duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 ${colorConfig.focusRingClass}`}
            >
              <div className="flex items-center gap-3">
                <InstagramIcon
                  className={`w-5 h-5 shrink-0 ${colorConfig.iconColorClass}`}
                  style={{ color: colorConfig.hex }}
                />
                <span>Instagram</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
            </a>
          )}

          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-full h-11 px-5 rounded-lg border border-gray-200 ${colorConfig.buttonHoverClass} text-gray-900 text-sm font-medium transition-all duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 ${colorConfig.focusRingClass}`}
            >
              <div className="flex items-center gap-3">
                <LinkedinIcon
                  className={`w-5 h-5 shrink-0 ${colorConfig.iconColorClass}`}
                  style={{ color: colorConfig.hex }}
                />
                <span>LinkedIn</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
            </a>
          )}
        </div>
      </div>

      <footer className="text-center pt-8">
        <p className="text-xs text-gray-400 tracking-wide">
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
