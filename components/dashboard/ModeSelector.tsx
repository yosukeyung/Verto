import React from 'react'
import type { ActiveMode } from '@/types/database'

interface ModeSelectorProps {
  activeMode: ActiveMode
  onChangeMode: (mode: ActiveMode) => void
}

const MODES: { id: ActiveMode; title: string; description: string }[] = [
  {
    id: 'social',
    title: 'Social Mode',
    description: 'Tampilkan profil publik untuk networking dan media sosial',
  },
  {
    id: 'lost_and_found',
    title: 'Lost & Found',
    description: 'Halaman kontak barang hilang dengan proteksi identitas',
  },
  {
    id: 'event_hub',
    title: 'Event Hub',
    description: 'Landing page acara kampus, organisasi, dan informasi kegiatan',
  },
]

export function ModeSelector({ activeMode, onChangeMode }: ModeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-900 mb-1">
        Mode Aktif Tag
      </div>
      <div role="radiogroup" aria-label="Pilih Mode Tag" className="space-y-2">
        {MODES.map((mode) => {
          const isSelected = activeMode === mode.id
          return (
            <div
              key={mode.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onChangeMode(mode.id)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault()
                  onChangeMode(mode.id)
                }
              }}
              className={`w-full p-4 rounded-lg cursor-pointer transition-colors duration-150 flex items-start gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                isSelected
                  ? 'border-l-2 border-indigo-600 bg-indigo-50 border-t border-r border-b border-indigo-200'
                  : 'border border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="pt-0.5">
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm font-semibold ${
                    isSelected ? 'text-indigo-900' : 'text-gray-900'
                  }`}
                >
                  {mode.title}
                </div>
                <div
                  className={`text-xs mt-0.5 ${
                    isSelected ? 'text-indigo-700' : 'text-gray-500'
                  }`}
                >
                  {mode.description}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
