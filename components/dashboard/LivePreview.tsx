'use client'

import React from 'react'
import { ExternalLink } from 'lucide-react'
import type { ActiveMode } from '@/types/database'
import { SocialView } from '@/components/landing/SocialView'
import { LostFoundView } from '@/components/landing/LostFoundView'
import { EventHubView } from '@/components/landing/EventHubView'
import { useUser } from '@/components/providers/UserContext'

interface LivePreviewProps {
  activeMode: ActiveMode
  metadata: Record<string, any>
  tagId: string
  avatarId?: string
  onOpenFullPage?: () => void
}

export function LivePreview({
  activeMode,
  metadata,
  tagId,
  avatarId,
  onOpenFullPage,
}: LivePreviewProps) {
  const { profile } = useUser()
  const resolvedAvatarId = avatarId ?? profile.avatar_id ?? 'love'
  const isPreviewDark = (metadata.page_theme || metadata.pageTheme) === 'dark'

  return (
    <div className="flex flex-col items-center w-full">
      {/* Frame Header Bar */}
      <div className="w-full max-w-[280px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-xs font-semibold tracking-wider uppercase text-gray-900 dark:text-white">
            Live Preview
          </span>
        </div>
        <span className="text-[11px] font-mono text-gray-500 dark:text-neutral-400">
          /t/{tagId}
        </span>
      </div>

      {/* Modern Minimalist Slim Phone Frame (aspect-[9/19.5], 280px) */}
      <div
        className={`relative w-[280px] max-w-[280px] rounded-[38px] border-[6px] border-black dark:border-neutral-700 shadow-2xl overflow-hidden flex flex-col shrink-0 transition-colors duration-200 ${
          isPreviewDark ? 'bg-neutral-900 text-white' : 'bg-white text-gray-900'
        }`}
        style={{ aspectRatio: '9 / 19.5' }}
      >
        {/* Overlay Dynamic Island / Speaker Pill */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-black rounded-full flex items-center justify-end px-1.5 z-20 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
        </div>

        {/* Screen Content Viewport */}
        <div className="flex-1 overflow-y-auto flex flex-col justify-between scrollbar-hide">
          {activeMode === 'social' && (
            <SocialView
              metadata={metadata}
              avatarId={resolvedAvatarId}
              isPreview
              className="min-h-full flex-1"
            />
          )}

          {activeMode === 'lost_and_found' && (
            <LostFoundView
              metadata={metadata}
              avatarId={resolvedAvatarId}
              isPreview
              className="min-h-full flex-1"
            />
          )}

          {activeMode === 'event_hub' && (
            <EventHubView
              metadata={metadata}
              isPreview
              className="min-h-full flex-1"
            />
          )}
        </div>

        {/* Overlay Home Indicator Bar */}
        <div
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full z-20 pointer-events-none ${
            isPreviewDark ? 'bg-neutral-700' : 'bg-gray-300'
          }`}
        />
      </div>

      {/* Auxiliary Link with Unsaved Changes Guard */}
      <div className="w-full max-w-[280px] flex items-center justify-between mt-3 px-1 text-xs text-gray-500 dark:text-neutral-400">
        <span className="text-[11px]">Instant real-time sync</span>
        <button
          type="button"
          onClick={onOpenFullPage}
          className="inline-flex items-center gap-1 font-medium text-gray-900 hover:text-black dark:text-white dark:hover:text-neutral-200 underline underline-offset-2 transition-colors cursor-pointer"
        >
          <span>Open Full Page</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
