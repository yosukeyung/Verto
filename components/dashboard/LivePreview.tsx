'use client'

import React from 'react'
import { ExternalLink } from 'lucide-react'
import type { ActiveMode } from '@/types/database'
import { SocialView } from '@/components/landing/SocialView'
import { LostFoundView } from '@/components/landing/LostFoundView'
import { EventHubView } from '@/components/landing/EventHubView'

interface LivePreviewProps {
  activeMode: ActiveMode
  metadata: Record<string, any>
  tagId: string
  onOpenFullPage?: () => void
}

export function LivePreview({
  activeMode,
  metadata,
  tagId,
  onOpenFullPage,
}: LivePreviewProps) {
  return (
    <div className="flex flex-col items-center w-full">
      {/* Frame Header Bar */}
      <div className="w-full max-w-[280px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-gray-900">
            Live Preview
          </span>
        </div>
        <span className="text-[11px] font-mono text-gray-500">
          /t/{tagId}
        </span>
      </div>

      {/* Modern Minimalist Slim Phone Frame (aspect-[9/19.5], 280px) */}
      <div
        className="relative w-[280px] max-w-[280px] rounded-[38px] border-[6px] border-black bg-white shadow-2xl overflow-hidden flex flex-col shrink-0"
        style={{ aspectRatio: '9 / 19.5' }}
      >
        {/* Dynamic Island / Speaker Pill */}
        <div className="pt-2 pb-1 shrink-0 flex items-center justify-center bg-white z-20">
          <div className="w-16 h-3.5 bg-black rounded-full flex items-center justify-end px-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-900" />
          </div>
        </div>

        {/* Screen Content Viewport */}
        <div className="flex-1 overflow-y-auto bg-white flex flex-col justify-between scrollbar-hide">
          {activeMode === 'social' && (
            <SocialView
              metadata={metadata}
              isPreview
              className="min-h-full py-4 px-2.5 flex-1 flex flex-col justify-between"
            />
          )}

          {activeMode === 'lost_and_found' && (
            <LostFoundView
              metadata={metadata}
              isPreview
              className="min-h-full py-4 px-2.5 flex-1 flex flex-col justify-between"
            />
          )}

          {activeMode === 'event_hub' && (
            <EventHubView
              metadata={metadata}
              isPreview
              className="min-h-full py-4 px-2.5 flex-1 flex flex-col justify-between"
            />
          )}
        </div>

        {/* Home Indicator Bar */}
        <div className="py-2 shrink-0 flex items-center justify-center bg-white z-20">
          <div className="w-20 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Auxiliary Link with Unsaved Changes Guard */}
      <div className="w-full max-w-[280px] flex items-center justify-between mt-3 px-1 text-xs text-gray-500">
        <span className="text-[11px]">Instant real-time sync</span>
        <button
          type="button"
          onClick={onOpenFullPage}
          className="inline-flex items-center gap-1 font-medium text-gray-900 hover:text-black underline underline-offset-2 transition-colors cursor-pointer"
        >
          <span>Open Full Page</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
