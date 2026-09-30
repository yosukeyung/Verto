'use client'

import React, { useState, useMemo } from 'react'
import { Check, ExternalLink, Loader2 } from 'lucide-react'
import type { TagRow, ActiveMode, ThemeFont, ThemeColor } from '@/types/database'
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

export function TagSettingsForm({
  activeTag,
  profileFullName,
  onSaveSuccess,
}: TagSettingsFormProps) {
  // Normalize initial data
  const initialMode = activeTag.active_mode
  const initialMetadata = useMemo(() => {
    const raw = (activeTag.metadata as Record<string, any>) || {}
    const base: Record<string, any> = {
      theme_font: 'sans' as ThemeFont,
      theme_color: 'orange' as ThemeColor,
      ...raw,
    }
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

    const allKeys = Array.from(new Set([...Object.keys(initialMetadata), ...Object.keys(metadata)]))
    for (const key of allKeys) {
      if (key === 'theme_font' || key === 'theme_color') continue
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

    const finalMetadata = {
      theme_font: 'sans',
      theme_color: 'orange',
      ...metadata,
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
            className="inline-flex items-center gap-0.5 font-bold text-green-950 underline underline-offset-2 hover:opacity-80 transition-opacity"
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

      <div className="pt-2 border-t border-gray-200">
        <div className="text-sm font-semibold text-gray-900 mb-4">
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
        <div className="pt-6 border-t border-gray-200 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Theme Customization
          </h3>
          <p className="text-xs text-gray-500">
            Select typography and color with instant real-time miniature preview.
          </p>
        </div>

        {/* Upper Middle: Scaled-down Vertical Mobile Preview */}
        <div className="flex flex-col items-center py-2">
          <div
            className="relative w-[148px] h-[316px] max-h-[320px] mx-auto rounded-[24px] border-[4px] border-black bg-white shadow-lg overflow-hidden flex flex-col items-center justify-between"
            style={{ aspectRatio: '9 / 19.5' }}
          >
            {/* Mini Dynamic Island */}
            <div className="w-8 h-1.5 bg-black rounded-full mt-1.5 mb-0.5 shrink-0 z-10" />

            {/* Scaled-down Micro Landing View */}
            <div className="w-[296px] h-[610px] origin-top scale-[0.49] pointer-events-none select-none flex-1">
              {activeMode === 'social' && (
                <SocialView
                  metadata={metadata}
                  isPreview
                  className="h-full py-4 px-3 flex flex-col justify-between"
                />
              )}
              {activeMode === 'lost_and_found' && (
                <LostFoundView
                  metadata={metadata}
                  isPreview
                  className="h-full py-4 px-3 flex flex-col justify-between"
                />
              )}
              {activeMode === 'event_hub' && (
                <EventHubView
                  metadata={metadata}
                  isPreview
                  className="h-full py-4 px-3 flex flex-col justify-between"
                />
              )}
            </div>

            {/* Mini Home Indicator */}
            <div className="w-12 h-0.5 bg-gray-300 rounded-full mb-1 shrink-0 z-10" />
          </div>

          <a
            href={`/t/${activeTag.tag_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-black mt-2 transition-colors"
          >
            <span>Open Live Page</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>

        {/* Lower Middle: Tabbed Controls (Typography & Color) */}
        <div className="space-y-3">
          <div className="flex p-0.5 rounded-lg bg-gray-100 border border-gray-200" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeThemeTab === 'typography'}
              onClick={() => setActiveThemeTab('typography')}
              className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeThemeTab === 'typography'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
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
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
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
                        ? 'border-gray-900 bg-gray-50 text-gray-900 font-semibold ring-1 ring-gray-900'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme_font"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setMetadata({ ...metadata, theme_font: opt.id })}
                      className="w-3.5 h-3.5 text-gray-900 border-gray-300 focus:ring-gray-900 accent-gray-900"
                    />
                    <span className={opt.fontClass}>{opt.label}</span>
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 py-1" role="radiogroup" aria-label="Accent Color Selector">
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
                    className={`w-9 h-9 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-gray-900 scale-105 shadow-sm'
                        : 'hover:scale-105 hover:opacity-90'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {isSelected && (
                      <Check className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={2.5} />
                    )}
                  </button>
                )
              })}
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
              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 cursor-pointer active:scale-[0.99]'
              : 'bg-gray-100 text-gray-400 border border-gray-200 opacity-50 cursor-not-allowed'
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
