import React from 'react'
import { ExternalLink } from 'lucide-react'
import type { EventHubMetadata } from '@/types/database'
import { resolveTagTheme } from '@/lib/tag-theme'

export interface EventHubViewProps {
  metadata: Partial<EventHubMetadata> & Record<string, any>
  className?: string
  isPreview?: boolean
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
  const rawTitle = metadata.title ?? metadata.eventTitle ?? ''
  const rawDescription = metadata.description ?? metadata.eventDescription ?? ''
  const { link_1, link_2, link_3 } = metadata

  const { fontClass, accent, isDark } = resolveTagTheme(metadata)
  const effectiveColor = accent.hex

  const displayTitle =
    String(rawTitle).trim() || (isPreview ? 'Tech Symposium 2026' : 'Event Information')
  const displayDescription =
    String(rawDescription).trim() ||
    (isPreview ? 'Join us for keynotes, workshops, and networking.' : '')

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

  const links: LinkItem[] =
    isPreview && rawLinks.length === 0
      ? [{ url: 'https://event.com/rsvp' }, { url: 'https://event.com/schedule' }]
      : rawLinks

  return (
    <main
      className={`flex flex-col justify-between transition-colors duration-150 ${
        isDark ? 'bg-neutral-900 text-white' : 'bg-white text-gray-900'
      } ${
        isPreview ? '' : 'min-h-screen'
      } ${className || ''} ${fontClass} ${isPreview ? 'pointer-events-none select-none' : ''}`}
      style={{ '--theme-accent': effectiveColor } as React.CSSProperties}
    >
      {/* Top Edge-to-Edge Editorial Banner */}
      <div className="w-full flex-1 flex flex-col">
        <header
          className={`w-full ${
            isDark ? accent.bannerGradientDark : accent.bannerGradientLight
          } ${isPreview ? 'pt-12 pb-6' : 'pt-14 pb-8'}`}
        >
          <div className="w-full max-w-[400px] mx-auto px-4 grid grid-cols-12 items-end gap-3">
            <div className="col-span-8 text-left min-w-0">
              <h1
                className={`text-2xl font-bold leading-tight tracking-tight break-words ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {displayTitle}
              </h1>
              {displayDescription && (
                <p
                  className={`mt-2 text-sm leading-relaxed break-words ${
                    isDark ? 'text-neutral-300' : 'text-gray-700'
                  }`}
                >
                  {displayDescription}
                </p>
              )}
            </div>
            <div className="col-span-4" aria-hidden="true" />
          </div>
        </header>

        {/* Body / Links Stack */}
        {links.length > 0 && (
          <div className="w-full max-w-[400px] mx-auto px-4 pt-3 space-y-3">
            {links.map((item, idx) => {
              const fullUrl = item.url.startsWith('http') ? item.url : `https://${item.url}`
              const customTitle = item.title?.trim()
              const label =
                customTitle && customTitle.length > 0 ? customTitle : formatUrlLabel(item.url)

              return (
                <a
                  key={idx}
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full h-11 px-5 rounded-lg border text-sm font-medium transition-colors duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isDark
                      ? 'border-neutral-800 bg-neutral-900/80 text-white hover:bg-neutral-800 focus-visible:outline-white'
                      : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50 focus-visible:outline-gray-900'
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <ExternalLink
                    className={`w-4 h-4 shrink-0 ml-2 ${
                      isDark ? 'text-neutral-400' : 'text-gray-500'
                    }`}
                    strokeWidth={1.75}
                  />
                </a>
              )
            })}
          </div>
        )}
      </div>

      <footer className={`text-center px-4 ${isPreview ? 'pt-6 pb-5' : 'pt-8 pb-10'}`}>
        <p className={`text-xs tracking-wide ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
