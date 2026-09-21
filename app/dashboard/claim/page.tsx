'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Tag, Loader2, AlertCircle } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import { claimTag } from '@/app/dashboard/actions'

function ClaimForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tagId = searchParams.get('tag_id') || ''

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaim = async () => {
    if (!tagId) {
      setError('Parameter tag_id tidak ditemukan.')
      return
    }

    setLoading(true)
    setError(null)

    const res = await claimTag(tagId)
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
        <p className="text-sm text-gray-500 mb-4">Tag ID tidak disertakan dalam permintaan.</p>
        <Link href="/dashboard" className="text-sm text-indigo-600 font-medium hover:underline">
          Kembali ke Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Tag className="w-6 h-6" strokeWidth={1.75} />
        </div>
        <h1 className="text-2xl font-bold leading-tight text-gray-900">
          Klaim Tag NFC
        </h1>
        <div className="w-8 border-b border-indigo-600 mx-auto mt-2 mb-4" />
        <p className="text-sm text-gray-500">
          Hubungkan tag fisik ke akun Anda untuk mengatur profil dan tautan.
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-800 text-base font-mono font-medium border border-gray-200">
          <span>Tag ID:</span>
          <span className="font-bold text-gray-900">{tagId}</span>
        </div>
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

      <div className="space-y-3">
        <Button
          variant="primary"
          isLoading={loading}
          onClick={handleClaim}
          className="w-full"
        >
          Klaim & Tambahkan ke Akun
        </Button>
        <Link href="/dashboard" className="block">
          <Button variant="secondary" className="w-full">
            Batal
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function ClaimPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col justify-center px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" strokeWidth={1.75} />
            </div>
          }
        >
          <ClaimForm />
        </Suspense>
      </main>
    </div>
  )
}
