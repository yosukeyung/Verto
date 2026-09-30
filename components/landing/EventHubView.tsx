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

const COLOR_MAP: Record<ThemeColor, { hex: string; underlineClass: string; hoverClass: string }> = {
  orange: {
    hex: '#FF5C00',
    underlineClass: 'border-[#FF5C00]',
    hoverClass: 'hover:border-[#FF5C00] hover:bg-[#FF5C00]/5',
  },
  black: {
    hex: '#000000',
    underlineClass: 'border-black',
    hoverClass: 'hover:border-black hover:bg-black/5',
  },
  emerald: {
    hex: '#10B981',
    underlineClass: 'border-[#10B981]',
    hoverClass: 'hover:border-[#10B981] hover:bg-[#10B981]/5',
  },
  blue: {
    hex: '#3B82F6',
    underlineClass: 'border-[#3B82F6]',
    hoverClass: 'hover:border-[#3B82F6] hover:bg-[#3B82F6]/5',
  },
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
  const themeColorKey: ThemeColor = (metadata.theme_color as ThemeColor) || 'orange'

  const fontClass = FONT_MAP[themeFontKey] || FONT_MAP.sans
  const colorConfig = COLOR_MAP[themeColorKey] || COLOR_MAP.orange

  const rawLinks = [link_1, link_2, link_3].filter(Boolean) as string[]
  const links = isPreview && rawLinks.length === 0
    ? ['https://event.com/rsvp', 'https://event.com/schedule']
    : rawLinks

  return (
    <main
      className={`bg-white flex flex-col justify-between ${
        className || 'min-h-screen px-4 py-12'
      } ${fontClass} ${isPreview ? 'pointer-events-none select-none' : ''}`}
      style={{ '--theme-accent': colorConfig.hex } as React.CSSProperties}
    >
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Header */}
        <div className="mb-8">
          <div
            className="w-12 h-12 rounded-full border flex items-center justify-center mx-auto mb-4"
            style={{
              backgroundColor: `${colorConfig.hex}15`,
              borderColor: `${colorConfig.hex}30`,
              color: colorConfig.hex,
            }}
          >
            <Calendar className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {title || (isPreview ? 'Tech Symposium 2026' : 'Event Information')}
          </h1>
          <div
            className={`w-8 border-b-2 ${colorConfig.underlineClass} mx-auto mt-2 mb-3`}
            style={{ borderColor: colorConfig.hex }}
          />
          {(description || isPreview) && (
            <p className="text-base text-gray-600 leading-normal max-w-xs mx-auto">
              {description || (isPreview ? 'Join us for keynotes, workshops, and networking.' : '')}
            </p>
          )}
        </div>

        {/* Links Stack */}
        {links.length > 0 && (
          <div className="space-y-3 w-full">
            {links.map((link, idx) => {
              const fullUrl = link.startsWith('http') ? link : `https://${link}`
              const label = formatUrlLabel(link)

              return (
                <a
                  key={idx}
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-11 px-5 rounded-lg border border-gray-200 ${colorConfig.hoverClass} text-gray-900 text-sm font-medium transition-all duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2`}
                >
                  <span className="truncate">{label}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 shrink-0 ml-2" strokeWidth={1.75} />
                </a>
              )
            })}
          </div>
        )}
      </div>

      <footer className="text-center pt-8">
        <p className="text-xs text-gray-400 tracking-wide">
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
