import Link from 'next/link'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Card } from '@/components/ui/Card'

export const metadata = {
  title: 'Getting Started - Verto',
  description: 'Step-by-step guide to setting up and configuring your Verto smart NFC tag in under 2 minutes.',
}

export default function GuidePage() {
  const waOrderUrl =
    'https://wa.me/6281234567890?text=' +
    encodeURIComponent('Hello Verto, I would like to order an NFC tag.')

  const steps = [
    {
      number: 1,
      title: 'Order the Tag',
      description:
        'Purchase your Verto physical tag (anti-metal sticker or ABS keychain) directly via WhatsApp order. Your tag arrives pre-encoded with a unique cryptographic hardware identifier.',
      badge: 'Hardware',
    },
    {
      number: 2,
      title: 'Tap to Activate',
      description:
        'Hold your smartphone near the NFC tag. The device automatically reads the chip and opens the secure activation URL in your default mobile browser. No app install needed.',
      badge: 'NFC Scan',
    },
    {
      number: 3,
      title: 'Create an Account',
      description:
        'Because the tag is unowned, the edge proxy automatically routes you to the registration page with your Tag ID locked in. Sign up with your email and password to instantly claim ownership.',
      badge: 'Ownership',
    },
    {
      number: 4,
      title: 'Choose Mode & Save',
      description:
        'Access your personal dashboard to configure the active mode: Social Profile, Lost & Found protection, or Event Hub. Update your destination anytime in seconds.',
      badge: 'Dashboard',
    },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
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

      {/* Main Guide Content */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-10 space-y-8">
        {/* Header Section */}
        <header className="text-center space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors mb-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-gray-900">
            Getting Started with Verto
          </h1>
          <div className="w-8 border-b border-orange-500 mx-auto" />
          <p className="text-sm text-gray-500 leading-normal max-w-sm mx-auto">
            Follow this 4-step walkthrough to activate, claim, and configure your smart NFC tag in under 2 minutes.
          </p>
        </header>

        {/* Step-by-Step Vertical List */}
        <div className="space-y-4">
          {steps.map((step) => (
            <Card key={step.number} className="p-4 relative">
              <div className="flex items-start gap-3.5">
                <span className="w-7 h-7 rounded-full bg-orange-50 border border-orange-200 text-orange-600 font-bold flex items-center justify-center shrink-0 mt-0.5 text-xs">
                  {step.number}
                </span>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-gray-900">
                      {step.title}
                    </h2>
                    <span className="text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                      {step.badge}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons Section */}
        <section className="space-y-3 pt-4 border-t border-gray-100">
          <a
            href={waOrderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 border-b border-orange-600 shadow-sm"
          >
            <MessageCircle className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            <span>Order NFC Tag via WhatsApp</span>
          </a>

          <Link
            href="/"
            className="w-full h-11 px-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium transition-colors duration-150 inline-flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
          >
            Return to Home
          </Link>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-200 py-6 text-center">
        <p className="text-xs text-gray-400">
          © Verto 2026. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
