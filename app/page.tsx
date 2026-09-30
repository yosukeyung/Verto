'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { StaggerHeadline } from '@/components/ui/StaggerHeadline'
import { SignInButton } from '@/components/ui/SignInButton'
import { NfcHelpModal } from '@/components/landing/NfcHelpModal'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)

  const waOrderUrl =
    'https://wa.me/6281234567890?text=' +
    encodeURIComponent('Hello Verto, I would like to order an NFC tag.')

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between overflow-x-clip">
      {/* 56px Navigation Header */}
      <Navbar rightAction={<SignInButton />} />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pb-12 space-y-12">
        {/* Hero Section */}
        <section className="relative isolate text-center space-y-4 pt-16 md:pt-22">
          {/* Subtle Diffused Orange Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-orange-500/30 blur-[100px] pointer-events-none"


            aria-hidden="true"
          />

          <StaggerHeadline />

          <div className="pt-2 flex flex-col items-center gap-2.5">
            <a
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 border-b border-orange-600 shadow-sm"
            >
              <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <span>Buy Our Products</span>
            </a>

            <button
              type="button"
              onClick={() => setIsHelpModalOpen(true)}
              className="text-xs text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors duration-150 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded cursor-pointer"
            >
              New to NFC? Learn how to turn it on.
            </button>
          </div>
        </section>

        {/* How it Works Section (Vertical Numbered List per DESIGN.md) */}
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold leading-tight text-gray-900">
            How It Works
          </h2>

          <ol className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Get your tag</p>
                <p className="text-gray-500 mt-0.5">
                  Order a Verto anti-metal sticker or ABS keychain tag via WhatsApp.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Tap to activate</p>
                <p className="text-gray-500 mt-0.5">
                  Hold your smartphone near the physical tag to open its unique activation link.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-semibold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Choose mode and save</p>
                <p className="text-gray-500 mt-0.5">
                  Select your preferred mode in the dashboard: Social Mode, Lost & Found, or Event Hub.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* Available Modes Overview */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <h2 className="text-lg font-semibold leading-tight text-gray-900">
            Available Tag Modes
          </h2>

          <div className="space-y-2.5">
            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm font-semibold text-gray-900">Social Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Display public profile, WhatsApp, Instagram, and LinkedIn links in a single tap.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm font-semibold text-gray-900">Lost & Found Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Protect keys, bags, or wallets with a secure contact page for finders.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <p className="text-sm font-semibold text-gray-900">Event Hub Mode</p>
              <p className="text-xs text-gray-500 mt-0.5">
                Share event details, registration forms, and announcements in one place.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* NFC Help Modal */}
      <NfcHelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  )
}
