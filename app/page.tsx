import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export default function HomePage() {
  const waOrderUrl =
    'https://wa.me/6281234567890?text=' +
    encodeURIComponent('Hello Verto, I would like to order an NFC tag.')

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between overflow-x-hidden">
      {/* 56px Navigation Header */}
      <Navbar
        rightAction={
          <Link
            href="/login"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3.5 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Sign In
          </Link>
        }
      />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-12 space-y-12">
        {/* Hero Section */}
        <section className="relative isolate text-center space-y-4">
          {/* Subtle Diffused Orange Glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] rounded-full bg-orange-500/15 blur-[100px] pointer-events-none"
            aria-hidden="true"
          />

          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
            One Tap.
            <br />
            Infinite Possibilities.
          </h1>
          <div className="w-8 border-b border-orange-500 mx-auto" />
          <p className="text-base text-gray-500 leading-normal max-w-sm mx-auto">
            Share your professional profile, secure your belongings, and manage events with a single tap. No app required.
          </p>

          <div className="pt-2">
            <a
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 border-b border-orange-600 shadow-sm"
            >
              <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={1.75} />
              <span>Order NFC Tag via WhatsApp</span>
            </a>
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

        {/* Getting Started Guide CTA */}
        <section className="text-center space-y-3 pt-6 border-t border-gray-100">
          <h2 className="text-lg font-semibold leading-tight text-gray-900">
            Ready to digitalize your campus life?
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            See exactly how easy it is to set up your Verto tag in under 2 minutes.
          </p>
          <div className="pt-1">
            <Link
              href="/guide"
              className="w-full h-11 px-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
            >
              Read the Step-by-Step Guide
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">
          © Verto 2026. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
