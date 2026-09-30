'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export interface NfcHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NfcHelpModal({ isOpen, onClose }: NfcHelpModalProps) {
  const [mounted, setMounted] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Portal mount guard for SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  // Robust body scroll-lock
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Keyboard navigation: Escape key closes modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    window.addEventListener('keydown', handleKeyDown)
    // Focus close button on open for accessibility
    requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      {/* Dark blur backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nfc-modal-title"
        className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col p-6 text-black border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2
            id="nfc-modal-title"
            className="text-lg font-bold text-black tracking-tight"
          >
            How to use your Verto Tag
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="py-5 space-y-4 text-sm leading-relaxed">
          {/* iOS Section */}
          <div className="rounded-xl p-3.5 bg-gray-50 border border-gray-100 space-y-1">
            <p className="font-semibold text-black flex items-center gap-1.5">
              <span>Apple iOS</span>
            </p>
            <p className="text-gray-600 text-xs sm:text-sm">
              NFC is automatically enabled on iPhone XS and newer. Just tap the tag to the top-back edge of your phone.
            </p>
          </div>

          {/* Android Section */}
          <div className="rounded-xl p-3.5 bg-gray-50 border border-gray-100 space-y-1">
            <p className="font-semibold text-black flex items-center gap-1.5">
              <span>Android</span>
            </p>
            <p className="text-gray-600 text-xs sm:text-sm">
              Swipe down to access Quick Settings, or go to Settings &gt; Connections and toggle &apos;NFC&apos; on.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors duration-150 inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500 shadow-sm active:scale-[0.99]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
