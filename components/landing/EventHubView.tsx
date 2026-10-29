import React from 'react'
import { Calendar, ExternalLink } from 'lucide-react'
import type { EventHubMetadata, ThemeFont, ThemeColor } from '@/types/database'

export interface EventHubViewProps {
  metadata: Partial<EventHubMetadata> & Record<string, any>
  className?: string
  isPreview?: boolean
}

const FONT_MAP: Record<ThemeFont, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
}

const COLOR_MAP: Record<ThemeColor, { hex: string }> = {
  orange: { hex: '#FF5C00' },
  black: { hex: '#000000' },
  emerald: { hex: '#10B981' },
  blue: { hex: '#3B82F6' },
}

function formatUrlLabel(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return 'Visit Link'
  }
}

export function EventHubView({ metadata, className, isPreview = false }: EventHubViewProps) {
  const { title = 'Event Information', description = '', link_1, link_2, link_3 } = metadata

  const themeFontKey: ThemeFont = (metadata.theme_font as ThemeFont) || 'sans'
  const themeColorKey: ThemeColor = (metadata.theme_color as ThemeColor) === 'black' ? 'orange' : (metadata.theme_color as ThemeColor) || 'orange'
  const isDark = (metadata.page_theme || metadata.pageTheme) === 'dark'

  const fontClass = FONT_MAP[themeFontKey] || FONT_MAP.sans
  const colorConfig = COLOR_MAP[themeColorKey] || COLOR_MAP.orange
  const effectiveColor = colorConfig.hex

  type LinkItem = { url: string; title?: string | null }

  const rawLinks: LinkItem[] = []
  if (link_1 && link_1.trim().length > 0) {
    rawLinks.push({ url: link_1.trim(), title: metadata.link_1_title || metadata.link1_title })
  }
  if (link_2 && link_2.trim().length > 0) {
    rawLinks.push({ url: link_2.trim(), title: metadata.link_2_title || metadata.link2_title })
  }
  if (link_3 && link_3.trim().length > 0) {
    rawLinks.push({ url: link_3.trim(), title: metadata.link_3_title || metadata.link3_title })
  }

  const links: LinkItem[] = isPreview && rawLinks.length === 0
    ? [
        { url: 'https://event.com/rsvp' },
        { url: 'https://event.com/schedule' },
      ]
    : rawLinks

  return (
    <main
      className={`flex flex-col justify-between transition-colors duration-150 ${
        isDark ? 'bg-neutral-900 text-white' : 'bg-white text-gray-900'
      } ${
        className || 'min-h-screen px-4 py-12'
      } ${fontClass} ${isPreview ? 'pointer-events-none select-none' : ''}`}
      style={{ '--theme-accent': effectiveColor } as React.CSSProperties}
    >
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Header */}
        <div className="mb-8">
          <div
            className="w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: `${effectiveColor}15`,
              borderColor: `${effectiveColor}30`,
              color: effectiveColor,
            }}
          >
            <Calendar className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h1 className={`text-2xl font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {title || (isPreview ? 'Tech Symposium 2026' : 'Event Information')}
          </h1>
          <div
            className="w-8 border-b-2 mx-auto mt-2 mb-3"
            style={{ borderColor: effectiveColor }}
          />
          {(description || isPreview) && (
            <p className={`text-base leading-normal max-w-xs mx-auto ${isDark ? 'text-neutral-400' : 'text-gray-600'}`}>
              {description || (isPreview ? 'Join us for keynotes, workshops, and networking.' : '')}
            </p>
          )}
        </div>

        {/* Links Stack */}
        {links.length > 0 && (
          <div className="space-y-3 w-full">
            {links.map((item, idx) => {
              const fullUrl = item.url.startsWith('http') ? item.url : `https://${item.url}`
              const customTitle = item.title?.trim()
              const label = customTitle && customTitle.length > 0 ? customTitle : formatUrlLabel(item.url)

              return (
                <a
                  key={idx}
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-11 px-5 rounded-lg border text-sm font-medium transition-all duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isDark
                      ? 'border-neutral-800 bg-neutral-900/80 text-white hover:bg-neutral-800'
                      : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <ExternalLink className={`w-4 h-4 shrink-0 ml-2 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`} strokeWidth={1.75} />
                </a>
              )
            })}
          </div>
        )}
      </div>

      <footer className="text-center pt-8">
        <p className={`text-xs tracking-wide ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
