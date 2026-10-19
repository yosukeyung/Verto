'use client'

import React, { useState, useMemo } from 'react'
import { Check, ExternalLink, Loader2, Sun, Moon } from 'lucide-react'
import type { TagRow, ActiveMode, ThemeFont, ThemeColor, PageTheme } from '@/types/database'
import { ModeSelector } from '@/components/dashboard/ModeSelector'
import { ModeFormDispatcher } from '@/components/dashboard/ModeForms'
import { SocialView } from '@/components/landing/SocialView'
import { LostFoundView } from '@/components/landing/LostFoundView'
import { EventHubView } from '@/components/landing/EventHubView'
import { Toast, type ToastType } from '@/components/ui/Toast'
import { saveTagSettings } from '@/app/dashboard/actions'

interface TagSettingsFormProps {
  activeTag: TagRow
  profileFullName: string
  onSaveSuccess: (updatedTag: TagRow) => void
}

const FONT_OPTIONS: { id: ThemeFont; label: string; fontClass: string }[] = [
  { id: 'sans', label: 'Sans', fontClass: 'font-sans' },
  { id: 'serif', label: 'Serif', fontClass: 'font-serif' },
  { id: 'mono', label: 'Mono', fontClass: 'font-mono' },
]

const COLOR_OPTIONS: { id: ThemeColor; label: string; hex: string }[] = [
  { id: 'orange', label: 'Orange', hex: '#FF5C00' },
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'emerald', label: 'Emerald', hex: '#10B981' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
]

const PAGE_THEME_OPTIONS: { id: PageTheme; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
]

export function TagSettingsForm({
  activeTag,
  profileFullName,
  onSaveSuccess,
}: TagSettingsFormProps) {
  // Normalize initial data
  const initialMode = activeTag.active_mode
  const initialMetadata = useMemo(() => {
    const raw = (activeTag.metadata as Record<string, any>) || {}
    const pageTheme = (raw.page_theme || raw.pageTheme || 'light') as PageTheme
    const base: Record<string, any> = {
      theme_font: 'sans' as ThemeFont,
      theme_color: 'orange' as ThemeColor,
      page_theme: pageTheme,
      pageTheme: pageTheme,
      ...raw,
    }
    base.page_theme = pageTheme
    base.pageTheme = pageTheme

    if (initialMode === 'social' && !raw.name && profileFullName) {
      base.name = profileFullName
    } else if (initialMode === 'lost_and_found' && !raw.owner_name && profileFullName) {
      base.owner_name = profileFullName
    }
    return base
  }, [activeTag, initialMode, profileFullName])

  const [activeMode, setActiveMode] = useState<ActiveMode>(initialMode)
  const [metadata, setMetadata] = useState<Record<string, any>>(initialMetadata)
  const [activeThemeTab, setActiveThemeTab] = useState<'typography' | 'color'>('typography')
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; message: React.ReactNode } | null>(null)

  // Track dirty state by comparing current form state to initial Supabase data
  const hasChanges = useMemo(() => {
    if (activeMode !== initialMode) return true

    const currentFont = metadata.theme_font || 'sans'
    const initialFont = initialMetadata.theme_font || 'sans'
    if (currentFont !== initialFont) return true

    const currentColor = metadata.theme_color || 'orange'
    const initialColor = initialMetadata.theme_color || 'orange'
    if (currentColor !== initialColor) return true

    const currentTheme = metadata.page_theme || metadata.pageTheme || 'light'
    const initialTheme = initialMetadata.page_theme || initialMetadata.pageTheme || 'light'
    if (currentTheme !== initialTheme) return true

    const allKeys = Array.from(new Set([...Object.keys(initialMetadata), ...Object.keys(metadata)]))
    for (const key of allKeys) {
      if (
        key === 'theme_font' ||
        key === 'theme_color' ||
        key === 'page_theme' ||
        key === 'pageTheme'
      )
        continue
      const valA = metadata[key] ?? ''
      const valB = initialMetadata[key] ?? ''
      if (valA !== valB) return true
    }

    return false
  }, [activeMode, initialMode, metadata, initialMetadata])

  // Reset state to initial Supabase values
  const handleDiscard = () => {
    setActiveMode(initialMode)
    setMetadata(initialMetadata)
    setToast(null)
  }

  // Save changes to Supabase
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges || isSaving) return

    setIsSaving(true)
    setToast(null)

    const finalTheme = metadata.page_theme || metadata.pageTheme || 'light'
    const finalMetadata = {
      theme_font: 'sans',
      theme_color: 'orange',
      ...metadata,
      page_theme: finalTheme,
      pageTheme: finalTheme,
    }

    const res = await saveTagSettings(activeTag.tag_id, activeMode, finalMetadata)

    if (res?.error) {
      setToast({ type: 'error', message: res.error })
      setIsSaving(false)
      return
    }

    const updatedTag: TagRow = {
      ...activeTag,
      active_mode: activeMode,
      metadata: finalMetadata,
      updated_at: new Date().toISOString(),
    }

    onSaveSuccess(updatedTag)

    setToast({
      type: 'success',
      message: (
        <span className="flex items-center gap-1.5 flex-wrap">
          <span>Tag settings saved successfully.</span>
          <a
            href={`/t/${activeTag.tag_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-bold text-green-950 dark:text-green-100 underline underline-offset-2 hover:opacity-80 transition-opacity"
          >
            <span>View Live Page</span>
            <span aria-hidden="true">↗</span>
          </a>
        </span>
      ),
    })
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <ModeSelector
        activeMode={activeMode}
        onChangeMode={(newMode) => {
          setActiveMode(newMode)
          setToast(null)
        }}
      />

      <div className="pt-2 border-t border-gray-200 dark:border-neutral-800">
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {activeMode === 'social'
            ? 'Social Profile Settings'
            : activeMode === 'lost_and_found'
            ? 'Lost & Found Settings'
            : 'Event Settings'}
        </div>

        <ModeFormDispatcher
          activeMode={activeMode}
          metadata={metadata}
          onChangeMetadata={(newMeta) => setMetadata(newMeta)}
        />
      </div>

      {/* Step 4 Tour Target: Theme Customization & Save buttons */}
      <div id="tour-theme-and-save" className="space-y-6">
        {/* Theme Customization Section: Vertical Stack */}
        <div className="pt-6 border-t border-gray-200 dark:border-neutral-800 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Theme Customization
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            Select typography, color, and page theme with instant real-time miniature preview.
          </p>
        </div>

        {/* Upper Middle: Scaled-down Vertical Mobile Preview */}
        <div className="flex flex-col items-center py-2">
          {(() => {
            const isPreviewDark = (metadata.page_theme || metadata.pageTheme) === 'dark'
            return (
              <div
                className={`relative w-[148px] h-[316px] shrink-0 mx-auto rounded-[24px] border-[4px] border-black dark:border-neutral-700 shadow-lg overflow-hidden transition-colors duration-200 ${
                  isPreviewDark ? 'bg-neutral-900 text-white' : 'bg-white text-gray-900'
                }`}
              >
                {/* Mini Dynamic Island */}
                <div
                  className={`absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1.5 rounded-full z-20 pointer-events-none transition-colors ${
                    isPreviewDark ? 'bg-black border border-neutral-800' : 'bg-black'
                  }`}
                />

                {/* Scaled-down Micro Landing View */}
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
                  <div
                    className="w-[280px] h-[616px] origin-top-left"
                    style={{ transform: 'scale(0.5)' }}
                  >
                    {activeMode === 'social' && (
                      <SocialView
                        metadata={metadata}
                        isPreview
                        className="h-full pt-8 pb-6 px-3.5 flex flex-col justify-between"
                      />
                    )}
                    {activeMode === 'lost_and_found' && (
                      <LostFoundView
                        metadata={metadata}
                        isPreview
                        className="h-full pt-8 pb-6 px-3.5 flex flex-col justify-between"
                      />
                    )}
                    {activeMode === 'event_hub' && (
                      <EventHubView
                        metadata={metadata}
                        isPreview
                        className="h-full pt-8 pb-6 px-3.5 flex flex-col justify-between"
                      />
                    )}
                  </div>
                </div>

                {/* Mini Home Indicator */}
                <div
                  className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-full z-20 pointer-events-none transition-colors ${
                    isPreviewDark ? 'bg-neutral-700' : 'bg-gray-300'
                  }`}
                />
              </div>
            )
          })()}

          <a
            href={`/t/${activeTag.tag_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-black dark:text-neutral-400 dark:hover:text-white mt-2 transition-colors"
          >
            <span>Open Live Page</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Lower Middle: Tabbed Controls (Typography & Color) */}
        <div className="space-y-3">
          <div className="flex p-0.5 rounded-lg bg-gray-100 border border-gray-200 dark:bg-neutral-900 dark:border-neutral-800" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeThemeTab === 'typography'}
              onClick={() => setActiveThemeTab('typography')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeThemeTab === 'typography'
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-black dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Typography
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeThemeTab === 'color'}
              onClick={() => setActiveThemeTab('color')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeThemeTab === 'color'
                  ? 'bg-white text-gray-900 shadow-xs dark:bg-black dark:text-white'
                  : 'text-gray-500 hover:text-gray-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              Color
            </button>
          </div>

          {activeThemeTab === 'typography' ? (
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Typography Selector">
              {FONT_OPTIONS.map((opt) => {
                const isSelected = (metadata.theme_font || 'sans') === opt.id
                return (
                  <label
                    key={opt.id}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm cursor-pointer transition-all duration-150 select-none ${
                      isSelected
                        ? 'border-gray-900 bg-gray-50 text-gray-900 font-semibold ring-1 ring-gray-900 dark:border-white dark:bg-neutral-900 dark:text-white dark:ring-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme_font"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setMetadata({ ...metadata, theme_font: opt.id })}
                      className="w-3.5 h-3.5 text-gray-900 border-gray-300 focus:ring-gray-900 accent-gray-900 dark:accent-orange-500"
                    />
                    <span className={opt.fontClass}>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4 py-1">
              {/* Accent Color Section */}
              <div>
                <span className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">
                  Accent Color
                </span>
                <div className="flex items-center justify-center gap-4" role="radiogroup" aria-label="Accent Color Selector">
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = (metadata.theme_color || 'orange') === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${c.label} (${c.hex})`}
                        onClick={() => setMetadata({ ...metadata, theme_color: c.id })}
                        className={`w-9 h-9 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white dark:ring-offset-black ${
                          isSelected
                            ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-105 shadow-sm'
                            : 'hover:scale-105 hover:opacity-90'
                        } ${c.id === 'black' ? 'dark:outline dark:outline-1 dark:outline-neutral-700' : ''}`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={2.5} />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Page Theme Selector */}
              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800">
                <span className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-2">
                  Page Theme
                </span>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Page Theme Selector">
                  {PAGE_THEME_OPTIONS.map((themeOpt) => {
                    const isSelected =
                      (metadata.page_theme || metadata.pageTheme || 'light') === themeOpt.id
                    const IconComponent = themeOpt.icon
                    return (
                      <button
                        key={themeOpt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() =>
                          setMetadata({
                            ...metadata,
                            page_theme: themeOpt.id,
                            pageTheme: themeOpt.id,
                          })
                        }
                        className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all duration-150 select-none ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/50 text-orange-600 ring-1 ring-orange-500 dark:border-orange-500 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-900'
                        }`}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                        <span>{themeOpt.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Action Buttons & Dirty State Container */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={handleDiscard}
          disabled={!hasChanges || isSaving}
          className={`flex-1 h-11 px-4 rounded-lg text-sm font-medium transition-all duration-150 ${
            hasChanges && !isSaving
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-800 cursor-pointer active:scale-[0.99]'
              : 'bg-gray-100 text-gray-400 border border-gray-200 dark:bg-neutral-900 dark:text-neutral-500 dark:border-neutral-800 opacity-50 cursor-not-allowed'
          }`}
        >
          Discard Changes
        </button>
        <button
          type="submit"
          disabled={!hasChanges || isSaving}
          className={`flex-1 h-11 px-4 rounded-lg text-sm font-semibold transition-all duration-150 inline-flex items-center justify-center gap-2 ${
            hasChanges && !isSaving
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm cursor-pointer active:scale-[0.99]'
              : 'bg-orange-500 text-white opacity-50 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>
      </div>
    </form>
  )
}
