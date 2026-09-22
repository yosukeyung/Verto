import React from 'react'
import { Calendar, ExternalLink } from 'lucide-react'
import type { EventHubMetadata } from '@/types/database'

interface EventHubViewProps {
  metadata: Partial<EventHubMetadata>
}

function formatUrlLabel(url: string): string {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
    return parsed.hostname.replace(/^www\./, '')
  } catch {
    return 'Visit Link'
  }
}

export function EventHubView({ metadata }: EventHubViewProps) {
  const { title = 'Event Information', description = '', link_1, link_2, link_3 } = metadata

  const links = [link_1, link_2, link_3].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-4 py-12">
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Header */}
        <div className="mb-8">
          <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Calendar className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {title}
          </h1>
          <div className="w-8 border-b border-indigo-600 mx-auto mt-2 mb-3" />
          {description && (
            <p className="text-base text-gray-600 leading-normal max-w-xs mx-auto">
              {description}
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
                  className="w-full h-11 px-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium transition-colors duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
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
    </div>
  )
}
