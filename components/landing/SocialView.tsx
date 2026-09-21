import React from 'react'
import { MessageCircle, ExternalLink } from 'lucide-react'
import type { SocialMetadata } from '@/types/database'

interface SocialViewProps {
  metadata: Partial<SocialMetadata>
}

function InstagramIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function LinkedinIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

export function SocialView({ metadata }: SocialViewProps) {
  const { name, bio, wa, ig, linkedin } = metadata

  const waUrl = wa ? `https://wa.me/${wa.replace(/[^0-9]/g, '')}` : null
  const igUrl = ig ? `https://instagram.com/${ig.replace(/^@/, '')}` : null
  const linkedinUrl = linkedin ? (linkedin.startsWith('http') ? linkedin : `https://${linkedin}`) : null

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between px-4 py-12">
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center text-center">
        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            {name || 'Pengguna Verto'}
          </h1>
          <div className="w-8 border-b border-indigo-600 mx-auto mt-2 mb-3" />
          {bio && (
            <p className="text-base text-gray-500 leading-normal max-w-xs mx-auto">
              {bio}
            </p>
          )}
        </div>

        {/* Links Stack */}
        <div className="space-y-3 w-full">
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium transition-colors duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              <div className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-600 shrink-0" strokeWidth={1.75} />
                <span>WhatsApp</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
            </a>
          )}

          {igUrl && (
            <a
              href={igUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium transition-colors duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              <div className="flex items-center gap-3">
                <InstagramIcon className="w-5 h-5 text-pink-600 shrink-0" />
                <span>Instagram</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
            </a>
          )}

          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-11 px-5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-900 text-sm font-medium transition-colors duration-150 inline-flex items-center justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              <div className="flex items-center gap-3">
                <LinkedinIcon className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>LinkedIn</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
            </a>
          )}
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
