'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LoadingNavLink } from '@/components/ui/NavigationLoading'
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { TAG_LABEL_MAX_LENGTH } from '@/lib/tag-label'
import { registerWithTag } from './actions'

function RegisterForm({ tagId }: { tagId: string }) {
  const router = useRouter()

  const [tagName, setTagName] = useState('Your Tag 1')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setNotice(null)

    if (!tagName.trim()) {
      setError('Please enter a Tag Name.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    // Clear any previous session tutorial flags to guarantee new account gets onboarding
    try {
      localStorage.removeItem('hasSeenTutorial')
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('hasSeenTutorial')) {
          localStorage.removeItem(key)
        }
      })
    } catch {
      // Ignore localStorage error
    }

    const res = await registerWithTag({
      tagId,
      tagLabel: tagName,
      fullName,
      email,
      password,
    })

    if ('error' in res) {
      setError(res.error)
      setLoading(false)
      return
    }

    if (res.signedIn) {
      router.push(`/dashboard?tag=${encodeURIComponent(res.tagId)}`)
      router.refresh()
    } else {
      setNotice('Account created and tag linked. Please sign in to continue.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="w-full max-w-md mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold leading-tight text-gray-900">
              Register Your Tag
            </h1>
            <div className="w-8 border-b border-orange-500 mt-2 mb-3" />
            <p className="text-sm text-gray-600">
              Create your account and give your new Verto tag a name.
            </p>
          </div>

          {error && (
            <div 
              role="alert" 
              className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" strokeWidth={1.75} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div 
              role="status" 
              className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-800 flex items-start gap-2"
            >
              <span className="font-medium">{notice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="tagName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Tag Name
              </label>
              <input
                id="tagName"
                type="text"
                required
                maxLength={TAG_LABEL_MAX_LENGTH}
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Your Tag 1"
                aria-describedby="tagName-helper"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-base text-gray-900 placeholder:text-gray-400 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <p id="tagName-helper" className="text-xs text-gray-500 mt-1.5">
                Shown in your dashboard. You can rename it anytime.
              </p>
            </div>

            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-base text-gray-900 placeholder:text-gray-400 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                className="w-full h-11 px-3 rounded-lg border border-gray-200 text-base text-gray-900 placeholder:text-gray-400 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div>
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 pl-3 pr-10 rounded-lg border border-gray-200 text-base text-gray-900 placeholder:text-gray-400 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label 
                htmlFor="confirmPassword" 
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full h-11 pl-3 pr-10 rounded-lg border border-gray-200 text-base text-gray-900 placeholder:text-gray-400 bg-white transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.75} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 px-5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.75} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link 
              href={tagId ? `/login?tag_id=${encodeURIComponent(tagId)}` : '/login'} 
              className="text-orange-600 hover:underline font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
            >
              Sign In
            </Link>
          </p>

          <p className="text-center text-sm text-gray-600 mt-2">
            Need help?{' '}
            <LoadingNavLink
              href={
                tagId
                  ? `/support?from=${encodeURIComponent(`/register?tag_id=${encodeURIComponent(tagId)}`)}`
                  : '/support?from=%2Fregister'
              }
              className="inline-flex items-center min-h-11 px-1 text-orange-600 hover:underline font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
            >
              Contact Support
            </LoadingNavLink>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function RegisterPage({ initialTagId }: { initialTagId: string }) {
  return <RegisterForm tagId={initialTagId} />
}
