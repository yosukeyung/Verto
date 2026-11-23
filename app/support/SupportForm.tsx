'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import {
  SUPPORT_CATEGORIES,
  SUPPORT_DESCRIPTION_MAX,
  SUPPORT_DESCRIPTION_MIN,
} from '@/lib/support'

interface SupportFormProps {
  initialEmail?: string
  returnTo?: string | null
}

export default function SupportForm({
  initialEmail = '',
  returnTo = null,
}: SupportFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState(initialEmail)
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [website, setWebsite] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo)
      return
    }

    if (typeof window !== 'undefined' && window.history.length > 1) {
      try {
        if (document.referrer) {
          const refUrl = new URL(document.referrer)
          if (
            refUrl.origin === window.location.origin &&
            refUrl.pathname !== '/support' &&
            !refUrl.pathname.startsWith('/support/')
          ) {
            router.back()
            return
          }
        }
      } catch {
        // Fallback to home on malformed referrer
      }
    }

    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    const trimmedDescription = description.trim()

    if (!trimmedEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!category) {
      setError('Please select an issue category.')
      return
    }

    if (trimmedDescription.length < SUPPORT_DESCRIPTION_MIN) {
      setError(
        `Please enter at least ${SUPPORT_DESCRIPTION_MIN} characters describing the issue.`
      )
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          category,
          description: trimmedDescription,
          website,
        }),
      })

      const body = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(
          typeof body?.error === 'string' && body.error
            ? body.error
            : 'Failed to send email. Please try again tomorrow.'
        )
        return
      }

      setError('Failed to send email. Please try again tomorrow.')
    } catch {
      setError('Failed to send email. Please try again tomorrow.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-md mx-auto">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 min-h-11 px-1 -ml-1 mb-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.75} />
            <span>Back</span>
          </button>

          <div className="mb-6">
            <h1 className="text-2xl font-bold leading-tight text-gray-900">
              Report an Issue
            </h1>
            <div className="w-8 border-b border-orange-500 mt-2 mb-3" />
            <p className="text-sm text-gray-600">
              Tell us what went wrong. We will reply to your email.
            </p>
          </div>

          {submittedEmail ? (
            <div
              role="status"
              className="p-5 rounded-xl bg-green-50 border border-green-300 text-green-800 space-y-4"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="w-5 h-5 shrink-0 mt-0.5"
                  strokeWidth={1.75}
                />
                <div className="space-y-1">
                  <h2 className="text-base font-semibold">Report sent</h2>
                  <p className="text-sm leading-relaxed">
                    We received your message and will reply to{' '}
                    <span className="font-medium break-all">{submittedEmail}</span>.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSubmittedEmail(null)}
                  className="w-full sm:w-auto h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer"
                >
                  Send Another Report
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full sm:w-auto h-11 px-4 rounded-lg border border-green-700/30 text-sm font-medium inline-flex items-center justify-center hover:bg-green-100/70 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 cursor-pointer"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div
                  role="alert"
                  className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300 text-sm text-red-700 flex items-start gap-2"
                >
                  <AlertCircle
                    className="w-5 h-5 shrink-0 mt-0.5"
                    strokeWidth={1.75}
                  />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="sr-only" aria-hidden="true">
                  <label htmlFor="support-website">Website</label>
                  <input
                    id="support-website"
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="support-email"
                    className="block text-sm font-medium text-gray-900 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="support-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 text-base text-gray-900 placeholder:text-gray-500 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="support-category"
                    className="block text-sm font-medium text-gray-900 mb-1.5"
                  >
                    Issue Category
                  </label>
                  <select
                    id="support-category"
                    name="category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-11 px-3 rounded-lg border border-gray-300 text-base text-gray-900 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="">Select a category</option>
                    {SUPPORT_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="support-description"
                    className="block text-sm font-medium text-gray-900 mb-1.5"
                  >
                    Issue Description
                  </label>
                  <textarea
                    id="support-description"
                    name="description"
                    required
                    rows={5}
                    minLength={SUPPORT_DESCRIPTION_MIN}
                    maxLength={SUPPORT_DESCRIPTION_MAX}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened and any error message you saw."
                    className="w-full p-3 rounded-lg border border-gray-300 text-base text-gray-900 placeholder:text-gray-500 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-y"
                  />
                  <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                    <span>Minimum {SUPPORT_DESCRIPTION_MIN} characters.</span>
                    <span>
                      {description.length} / {SUPPORT_DESCRIPTION_MAX}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2
                          className="w-5 h-5 animate-spin"
                          strokeWidth={1.75}
                        />
                        <span>Sending report...</span>
                      </>
                    ) : (
                      <span>Send Report</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
