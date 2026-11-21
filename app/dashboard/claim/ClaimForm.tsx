'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Tag, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { claimTag } from '@/app/dashboard/actions'
import { TAG_LABEL_MAX_LENGTH } from '@/lib/tag-label'

interface ClaimFormProps {
  tagId: string
  defaultTagName: string
}

export function ClaimForm({ tagId, defaultTagName }: ClaimFormProps) {
  const router = useRouter()

  const [tagName, setTagName] = useState(defaultTagName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!tagId) {
      setError('Tag ID parameter is missing.')
      return
    }

    if (!tagName.trim()) {
      setError('Please enter a Tag Name.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await claimTag(tagId, tagName)
    if (res?.error) {
      setError(res.error)
      setLoading(false)
      return
    }

    router.push(`/dashboard?tag=${encodeURIComponent(tagId)}`)
    router.refresh()
  }

  if (!tagId) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
          No Tag ID was provided in the request.
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-orange-600 dark:text-orange-400 font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 rounded"
        >
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/30 flex items-center justify-center mx-auto mb-4 text-orange-500">
          <Tag className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
          Claim NFC Tag
        </h1>
        <div className="w-8 border-b border-[#FF5C00] mx-auto mt-2 mb-4" />
        <p className="text-sm text-gray-600 dark:text-neutral-400">
          Link this physical tag to your account to manage its profile and links.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-200 flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleClaim} className="space-y-4">
        <Input
          id="claim-tag-name"
          label="Tag Name"
          type="text"
          required
          maxLength={TAG_LABEL_MAX_LENGTH}
          value={tagName}
          onChange={(e) => {
            setTagName(e.target.value)
            if (error) setError(null)
          }}
          placeholder={defaultTagName}
          helperText="Shown in your dashboard. You can rename it anytime."
        />

        <div className="space-y-3 pt-1">
          <Button
            type="submit"
            variant="primary"
            isLoading={loading}
            className="w-full"
          >
            Claim & Add to Account
          </Button>
          <Link href="/dashboard" className="block">
            <Button variant="secondary" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
