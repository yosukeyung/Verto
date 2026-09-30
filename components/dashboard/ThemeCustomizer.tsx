'use client'

import React from 'react'
import { Check } from 'lucide-react'
import type { ThemeFont, ThemeColor } from '@/types/database'

interface ThemeCustomizerProps {
  metadata: Record<string, any>
  onChangeMetadata: (metadata: Record<string, any>) => void
}

const FONT_OPTIONS: { id: ThemeFont; label: string; preview: string; fontClass: string }[] = [
  { id: 'sans', label: 'Sans', preview: 'Inter', fontClass: 'font-sans' },
  { id: 'serif', label: 'Serif', preview: 'Editorial', fontClass: 'font-serif' },
  { id: 'mono', label: 'Mono', preview: 'Geist', fontClass: 'font-mono' },
]

const COLOR_OPTIONS: { id: ThemeColor; label: string; hex: string }[] = [
  { id: 'orange', label: 'Orange', hex: '#FF5C00' },
  { id: 'black', label: 'Black', hex: '#000000' },
  { id: 'emerald', label: 'Emerald', hex: '#10B981' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
]

export function ThemeCustomizer({ metadata, onChangeMetadata }: ThemeCustomizerProps) {
  const currentFont: ThemeFont = (metadata.theme_font as ThemeFont) || 'sans'
  const currentColor: ThemeColor = (metadata.theme_color as ThemeColor) || 'orange'

  const handleFontChange = (newFont: ThemeFont) => {
    onChangeMetadata({
      ...metadata,
      theme_font: newFont,
      theme_color: currentColor,
    })
  }

  const handleColorChange = (newColor: ThemeColor) => {
    onChangeMetadata({
      ...metadata,
      theme_font: currentFont,
      theme_color: newColor,
    })
  }

  return (
    <div className="space-y-5">
      {/* Font Family Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
          Typography
        </label>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Typography Selector">
          {FONT_OPTIONS.map((opt) => {
            const isSelected = currentFont === opt.id
            return (
              <label
                key={opt.id}
                className={`relative flex flex-col items-start px-3 py-2.5 rounded-lg border text-sm cursor-pointer transition-all duration-150 select-none ${
                  isSelected
                    ? 'border-gray-900 bg-gray-50 text-gray-900 font-semibold ring-1 ring-gray-900'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="theme_font"
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => handleFontChange(opt.id)}
                      className="w-3.5 h-3.5 text-gray-900 border-gray-300 focus:ring-gray-900 accent-gray-900"
                    />
                    <span className={opt.fontClass}>{opt.label}</span>
                  </div>
                  <span className={`text-[11px] ${opt.fontClass} ${isSelected ? 'text-gray-900' : 'text-gray-400'}`}>
                    Aa
                  </span>
                </div>
                <span className={`text-[10px] mt-1 pl-5 ${isSelected ? 'text-gray-500' : 'text-gray-400'}`}>
                  {opt.preview}
                </span>
              </label>
            )
          })}
        </div>
      </div>

      {/* Accent Color Swatches */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Accent Color
          </label>
          <span className="text-xs text-gray-500 capitalize font-medium">
            {COLOR_OPTIONS.find((c) => c.id === currentColor)?.label}
          </span>
        </div>
        <div className="flex items-center gap-3 pt-0.5" role="radiogroup" aria-label="Accent Color Selector">
          {COLOR_OPTIONS.map((c) => {
            const isSelected = currentColor === c.id
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-label={`${c.label} (${c.hex})`}
                onClick={() => handleColorChange(c.id)}
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
      </div>
    </div>
  )
}
