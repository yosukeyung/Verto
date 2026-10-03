import React from 'react'
import { ShieldAlert, MessageCircle } from 'lucide-react'
import type { LostAndFoundMetadata, ThemeFont, ThemeColor } from '@/types/database'

export interface LostFoundViewProps {
  metadata: Partial<LostAndFoundMetadata> & Record<string, any>
  className?: string
  isPreview?: boolean
}

const FONT_MAP: Record<ThemeFont, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
}

const COLOR_MAP: Record<ThemeColor, { hex: string; underlineClass: string }> = {
  orange: { hex: '#FF5C00', underlineClass: 'border-[#FF5C00]' },
  black: { hex: '#000000', underlineClass: 'border-black' },
  emerald: { hex: '#10B981', underlineClass: 'border-[#10B981]' },
  blue: { hex: '#3B82F6', underlineClass: 'border-[#3B82F6]' },
}

export function LostFoundView({ metadata, className, isPreview = false }: LostFoundViewProps) {
  const { item_name = 'Lost Item', owner_name = 'Owner', wa_number = '', custom_message = '' } = metadata

  const themeFontKey: ThemeFont = (metadata.theme_font as ThemeFont) || 'sans'
  const themeColorKey: ThemeColor = (metadata.theme_color as ThemeColor) || 'orange'

  const fontClass = FONT_MAP[themeFontKey] || FONT_MAP.sans
  const colorConfig = COLOR_MAP[themeColorKey] || COLOR_MAP.orange

  const cleanWa = wa_number.replace(/[^0-9]/g, '')
  const template = `Hello, I found your item (${item_name}). I found this contact information on your Verto tag.`
  const waUrl = cleanWa ? `https://wa.me/${cleanWa}?text=${encodeURIComponent(template)}` : '#'

  return (
    <main
      className={`bg-white flex flex-col justify-between ${
        className || 'min-h-screen px-4 py-12'
      } ${fontClass} ${isPreview ? 'pointer-events-none select-none' : ''}`}
      style={{ '--theme-accent': colorConfig.hex } as React.CSSProperties}
    >
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Badge & Notice */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
            <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block mb-3">
            Item Found
          </span>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {item_name || (isPreview ? 'Motorcycle Keys' : 'Lost Item')}
          </h1>
          <div
            className={`w-8 border-b-2 ${colorConfig.underlineClass} mx-auto mt-2 mb-3`}
            style={{ borderColor: colorConfig.hex }}
          />
          <p className="text-base text-gray-600">
            Owner: <span className="font-semibold text-gray-900">{owner_name || (isPreview ? 'Owner Name' : 'Owner')}</span>
          </p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-3 whitespace-pre-wrap">
            {custom_message && custom_message.trim().length > 0 
              ? custom_message 
              : 'Thank you for scanning this tag. You can reach out directly to the owner using the button below.'}
          </p>
        </div>

        {/* Primary CTA */}
        <div className="mt-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 px-5 rounded-lg text-white text-sm font-medium transition-all duration-150 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 shadow-sm"
            style={{ backgroundColor: colorConfig.hex }}
          >
            <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            <span>Contact Owner via WhatsApp</span>
          </a>
        </div>
      </div>

      <footer className="text-center pt-8">
        <p className="text-xs text-gray-400 tracking-wide">
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
