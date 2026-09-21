import React from 'react'
import { ShieldAlert, MessageCircle } from 'lucide-react'
import type { LostAndFoundMetadata } from '@/types/database'

interface LostFoundViewProps {
  metadata: Partial<LostAndFoundMetadata>
}

export function LostFoundView({ metadata }: LostFoundViewProps) {
  const { item_name = 'Barang Berharga', owner_name = 'Pemilik', wa_number = '' } = metadata

  const cleanWa = wa_number.replace(/[^0-9]/g, '')
  const template = `Halo, saya menemukan barang Anda (${item_name}). Saya mendapat kontak ini dari tag Verto.`
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(template)}`

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-4 py-12">
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Badge & Notice */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 text-amber-600">
            <ShieldAlert className="w-6 h-6" strokeWidth={1.75} />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 inline-block mb-3">
            Barang Ditemukan
          </span>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {item_name}
          </h1>
          <div className="w-8 border-b border-indigo-600 mx-auto mt-2 mb-3" />
          <p className="text-base text-gray-600">
            Pemilik: <span className="font-semibold text-gray-900">{owner_name}</span>
          </p>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-3">
            Terima kasih telah memindai tag ini. Anda dapat langsung mengabari pemilik barang melalui tombol di bawah.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="mt-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 shadow-sm"
          >
            <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            <span>Hubungi Pemilik via WhatsApp</span>
          </a>
        </div>
      </div>

      <footer className="text-center pt-8">
        <p className="text-xs text-gray-400 tracking-wide">
          Powered by Verto
        </p>
      </footer>
    </div>
  )
}
