'use client'

import React, { useState } from 'react'
import { ShieldAlert, MessageCircle, ChevronDown } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { LostAndFoundMetadata } from '@/types/database'
import { getAvatarSrc, isCustomAvatarUrl } from '@/lib/avatars'
import { resolveTagTheme } from '@/lib/tag-theme'
import {
  sanitizeAvatarStorageUrl,
  sanitizeProfileAvatarId,
} from '@/lib/url-validation'
import { AvatarWithLightbox } from '@/components/ui/AvatarWithLightbox'

export interface LostFoundViewProps {
  metadata: Partial<LostAndFoundMetadata> & Record<string, any>
  avatarId?: string | null
  avatarUrl?: string | null
  className?: string
  isPreview?: boolean
}

const DEFAULT_SUBHEADLINE =
  'This item belongs to someone. Tap below to let them know it is safe.'

export function LostFoundView({
  metadata,
  avatarId,
  avatarUrl,
  className,
  isPreview = false,
}: LostFoundViewProps) {
  const [isItemOpen, setIsItemOpen] = useState(false)
  const [isOwnerOpen, setIsOwnerOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const rawItemName = metadata.item_name ?? metadata.itemName ?? ''
  const rawItemPhotoUrl = metadata.item_photo_url ?? metadata.itemPhotoUrl ?? ''
  const rawOwnerName = metadata.owner_name ?? metadata.ownerName ?? ''
  const rawCustomMessage = metadata.custom_message ?? metadata.customMessage ?? ''
  const rawWaNumber = metadata.wa_number ?? metadata.waNumber ?? ''

  const { fontClass, accent, isDark } = resolveTagTheme(metadata)
  const effectiveColor = accent.hex

  const displayItemName = String(rawItemName).trim() || (isPreview ? 'Motorcycle Keys' : 'Lost Item')
  const itemPhotoUrl =
    sanitizeAvatarStorageUrl(rawItemPhotoUrl, { allowBlob: isPreview }) ?? ''
  const hasItemPhoto = itemPhotoUrl.length > 0

  const displayOwnerName = String(rawOwnerName).trim() || (isPreview ? 'Owner Name' : 'Owner')
  const trimmedMessage = String(rawCustomMessage).trim()
  const displayMessage = trimmedMessage.length > 0 ? trimmedMessage : DEFAULT_SUBHEADLINE

  const validatedOwnerAvatar =
    sanitizeProfileAvatarId(avatarId, { allowBlob: isPreview }) ??
    sanitizeAvatarStorageUrl(avatarUrl, { allowBlob: isPreview }) ??
    sanitizeProfileAvatarId(metadata.avatar_id, { allowBlob: isPreview }) ??
    sanitizeAvatarStorageUrl(metadata.avatar_url, { allowBlob: isPreview }) ??
    'love'
  const resolvedAvatarSrc = getAvatarSrc(validatedOwnerAvatar, { allowBlob: isPreview })
  const isCustomAvatar = isCustomAvatarUrl(resolvedAvatarSrc, { allowBlob: isPreview })

  const trimmedWa = String(rawWaNumber).trim()
  const displayWaNumber = trimmedWa || (isPreview ? '6281234567890' : 'Not provided')
  const cleanWa = String(rawWaNumber).replace(/[^0-9]/g, '')
  const template = `Hello, I found your item (${displayItemName}). I found this contact information on your Verto tag.`
  const waUrl = cleanWa ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(template)}` : null

  const morphDuration = shouldReduceMotion ? 0 : 0.18

  return (
    <main
      className={`flex flex-col justify-between transition-colors duration-150 ${isDark ? 'bg-neutral-900 text-white' : 'bg-white text-gray-900'
        } ${isPreview ? 'pt-10 pb-6 px-4 select-none' : 'min-h-dvh px-4 py-6 sm:py-12'
        } ${className || ''} ${fontClass}`}
      style={{ '--theme-accent': effectiveColor } as React.CSSProperties}
    >
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Top Accent Shield Icon */}
        <div
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border flex items-center justify-center mx-auto mb-3 sm:mb-4"
          style={{
            backgroundColor: `${effectiveColor}18`,
            borderColor: `${effectiveColor}38`,
            color: effectiveColor,
          }}
        >
          <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
        </div>

        {/* Static Alert Headline */}
        <h1
          className={`text-xl sm:text-2xl font-bold leading-tight tracking-tight ${isDark ? 'text-white' : 'text-gray-900'
            }`}
        >
          You found something!
        </h1>

        {/* Sub-headline (Custom Message or Fallback) */}
        <p
          className={`mt-1.5 sm:mt-2 text-sm leading-snug sm:leading-relaxed max-w-xs mx-auto whitespace-pre-wrap break-words ${isDark ? 'text-neutral-300' : 'text-gray-600'
            }`}
        >
          {displayMessage}
        </p>

        {/* Structured Info Card */}
        <div
          className={`mt-4 sm:mt-6 rounded-xl border p-3.5 sm:p-4 text-left space-y-2.5 sm:space-y-3 ${isDark
              ? 'bg-neutral-950/60 border-neutral-800'
              : 'bg-gray-50/50 border-gray-200'
            }`}
        >
          {/* ITEM Section (Conditional Dropdown only when item photo exists) */}
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-[10px] font-medium tracking-wider uppercase ${isDark ? 'text-neutral-400' : 'text-gray-500'
                  }`}
              >
                ITEM
              </p>

              {hasItemPhoto && (
                <button
                  type="button"
                  onClick={() => setIsItemOpen((prev) => !prev)}
                  aria-expanded={isItemOpen}
                  aria-controls="lost-found-item-details"
                  aria-label={isItemOpen ? 'Hide item photo' : 'Show item photo'}
                  className={`relative w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer before:absolute before:-inset-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 ${isDark
                      ? 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white focus-visible:outline-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-gray-900'
                    }`}
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isItemOpen ? 'rotate-180' : ''
                      }`}
                    strokeWidth={2}
                  />
                </button>
              )}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {isItemOpen && hasItemPhoto ? (
                <motion.div
                  key="item-expanded"
                  id="lost-found-item-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: morphDuration, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 flex items-center gap-3">
                    <AvatarWithLightbox
                      src={itemPhotoUrl}
                      alt={displayItemName}
                      isCustom
                      lightboxShape="rounded"
                      interactive={!isPreview}
                      className={`w-16 h-16 rounded-lg border shrink-0 overflow-hidden flex items-center justify-center ${isDark ? 'border-neutral-800 bg-neutral-900' : 'border-gray-200 bg-white'
                        }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-bold break-words ${isDark ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {displayItemName}
                      </p>
                      {!isPreview && (
                        <p
                          className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-gray-500'
                            }`}
                        >
                          Tap photo to enlarge
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="item-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: morphDuration }}
                  className={`mt-0.5 text-sm font-bold break-words ${isDark ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  {displayItemName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* OWNER Section (In-place Morphing, zero name duplication) */}
          <div
            className={`pt-2.5 sm:pt-3 border-t min-w-0 ${isDark ? 'border-neutral-800' : 'border-gray-200/80'
              }`}
          >
            <div className="flex items-center justify-between gap-3">
              <p
                className={`text-[10px] font-medium tracking-wider uppercase ${isDark ? 'text-neutral-400' : 'text-gray-500'
                  }`}
              >
                OWNER
              </p>

              <button
                type="button"
                onClick={() => setIsOwnerOpen((prev) => !prev)}
                aria-expanded={isOwnerOpen}
                aria-controls="lost-found-owner-details"
                aria-label={isOwnerOpen ? 'Hide owner details' : 'Show owner details'}
                className={`relative w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-150 cursor-pointer before:absolute before:-inset-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 ${isDark
                    ? 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 hover:text-white focus-visible:outline-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-gray-900'
                  }`}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${isOwnerOpen ? 'rotate-180' : ''
                    }`}
                  strokeWidth={2}
                />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {isOwnerOpen ? (
                <motion.div
                  key="owner-expanded"
                  id="lost-found-owner-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: morphDuration, ease: 'easeOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-1.5 flex items-center gap-3">
                    <AvatarWithLightbox
                      src={resolvedAvatarSrc}
                      alt={`${displayOwnerName} avatar`}
                      isCustom={isCustomAvatar}
                      lightboxShape="circle"
                      interactive={!isPreview}
                      className={`w-11 h-11 rounded-full border shrink-0 overflow-hidden flex items-center justify-center ${isDark ? 'bg-neutral-800' : 'bg-white'
                        }`}
                      style={{ borderColor: effectiveColor }}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-bold break-words ${isDark ? 'text-white' : 'text-gray-900'
                          }`}
                      >
                        {displayOwnerName}
                      </p>
                      <p
                        className={`text-xs font-mono break-all mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}
                      >
                        {displayWaNumber}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.p
                  key="owner-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: morphDuration }}
                  className={`mt-0.5 text-sm font-bold break-words ${isDark ? 'text-white' : 'text-gray-900'
                    }`}
                >
                  {displayOwnerName}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="mt-4 sm:mt-5">
          {waUrl || isPreview ? (
            <a
              href={waUrl || '#'}
              target={isPreview ? undefined : '_blank'}
              rel={isPreview ? undefined : 'noopener noreferrer'}
              tabIndex={isPreview ? -1 : undefined}
              onClick={isPreview ? (e) => e.preventDefault() : undefined}
              className={`w-full min-h-11 py-2.5 px-5 rounded-lg text-white text-sm font-semibold transition-opacity duration-150 hover:opacity-90 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm ${isPreview ? 'pointer-events-none' : ''
                } ${isDark ? 'focus-visible:outline-white' : 'focus-visible:outline-gray-900'
                }`}
              style={{ backgroundColor: effectiveColor }}
            >
              <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>Contact Owner</span>
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="w-full min-h-11 py-2.5 px-5 rounded-lg text-white text-sm font-semibold opacity-60 cursor-not-allowed inline-flex items-center justify-center gap-2"
              style={{ backgroundColor: effectiveColor }}
            >
              <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span>WhatsApp Not Configured</span>
            </button>
          )}
        </div>
      </div>

      <footer className="text-center pt-5 sm:pt-8">
        <p className={`text-xs tracking-wide ${isDark ? 'text-neutral-400' : 'text-gray-500'}`}>
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
