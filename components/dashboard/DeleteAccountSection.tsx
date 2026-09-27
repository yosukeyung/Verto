'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, X } from 'lucide-react'

const CONFIRM_PHRASE = 'CONFIRM'

export function DeleteAccountSection() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isConfirmed = inputValue === CONFIRM_PHRASE

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isModalOpen])

  function openModal() {
    setInputValue('')
    setError(null)
    setIsModalOpen(true)
  }

  function closeModal() {
    if (isDeleting) return
    setIsModalOpen(false)
    setInputValue('')
    setError(null)
  }

  async function handleDelete() {
    if (!isConfirmed || isDeleting) return
    setIsDeleting(true)
    setError(null)

    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Request failed (${res.status})`)
      }

      localStorage.clear()
      sessionStorage.clear()
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (!isModalOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isModalOpen, isDeleting])

  return (
    <>
      {/* ── Section ───────────────────────────────────────────────── */}
      <div className="mt-10 pt-8 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Danger Zone
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Permanently remove your account and all associated data. This cannot
          be undone.
        </p>
        <button
          id="delete-account-trigger"
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg
            hover:bg-red-50 hover:border-red-300 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />
          Delete Account
        </button>
      </div>

      {/* ── Modal ─────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5">
            {/* Close */}
            <button
              onClick={closeModal}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md
                focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 disabled:opacity-40"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon + Heading */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" strokeWidth={1.75} />
              </div>
              <div>
                <h2
                  id="delete-modal-title"
                  className="text-base font-semibold text-gray-900 leading-tight"
                >
                  Delete your account?
                </h2>
                <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                  This is permanent. Your profile, all linked tags, and their
                  configurations will be erased immediately and{' '}
                  <strong className="text-gray-600 font-medium">
                    cannot be recovered
                  </strong>
                  .
                </p>
              </div>
            </div>

            {/* Confirm input */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="delete-confirm-input"
                className="text-xs font-medium text-gray-500 tracking-wide uppercase"
              >
                Type{' '}
                <span className="font-semibold text-gray-800 font-mono">
                  {CONFIRM_PHRASE}
                </span>{' '}
                to continue
              </label>
              <input
                ref={inputRef}
                id="delete-confirm-input"
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setError(null)
                }}
                disabled={isDeleting}
                placeholder={CONFIRM_PHRASE}
                autoComplete="off"
                spellCheck={false}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg font-mono
                  placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-300
                  disabled:opacity-50 transition-shadow"
              />
            </div>

            {/* Inline error */}
            {error && (
              <p className="text-sm text-red-600 -mt-2">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={closeModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg
                  hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
                  disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                id="delete-confirm-button"
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg
                  hover:bg-red-700 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting…' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
