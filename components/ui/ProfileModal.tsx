'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  LogOut,
  Tag,
  Trash2,
  Check,
  Pencil,
} from 'lucide-react'

// ─── Avatar Definitions ────────────────────────────────────────────────────────

export interface AvatarOption {
  id: string
  name: string
  src: string
}

export const AVATARS: AvatarOption[] = [
  { id: 'love', name: 'Love', src: '/avatars/love.png' },
  { id: 'eat', name: 'Eat', src: '/avatars/eat.png' },
  { id: 'sleep', name: 'Sleep', src: '/avatars/sleep.png' },
  { id: 'angry', name: 'Angry', src: '/avatars/angry.png' },
  { id: 'cry', name: 'Cry', src: '/avatars/cry.png' },
  { id: 'study', name: 'Study', src: '/avatars/study.png' },
]

// ─── Props ─────────────────────────────────────────────────────────────────────

interface ProfileModalProps {
  /** Called when user confirms sign-out */
  onSignOut?: () => void
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function ProfileModal({ onSignOut }: ProfileModalProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('love')
  const [email, setEmail] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUnclaiming, setIsUnclaiming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Nested Avatar Selection Pop-up State
  const [isAvatarGalleryOpen, setIsAvatarGalleryOpen] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState('love')

  // Danger Zone Modals State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [unclaimModalOpen, setUnclaimModalOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [userTags, setUserTags] = useState<{ tag_id: string; active_mode: string }[]>([])
  const [selectedTagToUnclaim, setSelectedTagToUnclaim] = useState('')
  const [isLoadingTags, setIsLoadingTags] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  const activeAvatar = AVATARS.find((a) => a.id === selectedAvatar) ?? AVATARS[0]
  const previewAvatarOption = AVATARS.find((a) => a.id === previewAvatar) ?? activeAvatar

  // ─── Load Profile on Mount ───────────────────────────────────────────────────

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const data = await res.json()
          setName(data.full_name || '')
          setSelectedAvatar(data.avatar_id || 'love')
          setEmail(data.email || '')
        }
      } catch (err) {
        console.error('Error loading profile:', err)
      }
    }
    loadProfile()
  }, [])

  // ─── Open / close ────────────────────────────────────────────────────────────

  const open = () => {
    setSaved(false)
    setIsAvatarGalleryOpen(false)
    setIsOpen(true)
  }

  const close = useCallback(() => {
    setIsOpen(false)
    setIsAvatarGalleryOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  // ─── Keyboard: Escape to close ───────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAvatarGalleryOpen) {
          setIsAvatarGalleryOpen(false)
        } else {
          close()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, isAvatarGalleryOpen, close])

  // ─── Focus first element on open ─────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && !isAvatarGalleryOpen) {
      requestAnimationFrame(() => firstFocusRef.current?.focus())
    }
  }, [isOpen, isAvatarGalleryOpen])

  // ─── Scroll-lock ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ─── Avatar Gallery Handlers ─────────────────────────────────────────────────

  const openAvatarGallery = () => {
    setPreviewAvatar(selectedAvatar)
    setIsAvatarGalleryOpen(true)
  }

  const handleCancelAvatar = () => {
    setIsAvatarGalleryOpen(false)
  }

  const handleSaveAvatar = () => {
    setSelectedAvatar(previewAvatar)
    setIsAvatarGalleryOpen(false)
  }

  // ─── Profile Handlers ────────────────────────────────────────────────────────

  async function handleSave() {
    setIsSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name.trim(), avatar_id: selectedAvatar }),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        alert('Failed to save profile changes.')
      }
    } catch (err) {
      console.error(err)
      alert('Error saving profile changes.')
    } finally {
      setIsSaving(false)
    }
  }

  async function openUnclaimModal() {
    setConfirmText('')
    setUnclaimModalOpen(true)
    setIsLoadingTags(true)
    try {
      const res = await fetch('/api/tags')
      if (res.ok) {
        const data = await res.json()
        setUserTags(data.tags || [])
        if (data.tags && data.tags.length > 0) {
          setSelectedTagToUnclaim(data.tags[0].tag_id)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingTags(false)
    }
  }

  function openDeleteModal() {
    setConfirmText('')
    setDeleteModalOpen(true)
  }

  async function submitUnclaimTag() {
    if (confirmText !== 'CONFIRM' || !selectedTagToUnclaim) return
    setIsUnclaiming(true)
    try {
      const res = await fetch('/api/tags/unclaim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag_id: selectedTagToUnclaim }),
      })
      if (res.ok) {
        setUnclaimModalOpen(false)
        close()
        router.push('/dashboard')
        router.refresh()
      } else {
        alert('Failed to unclaim tag.')
      }
    } catch (err) {
      console.error(err)
      alert('Error unclaiming tag.')
    } finally {
      setIsUnclaiming(false)
    }
  }

  async function submitDeleteProfile() {
    if (confirmText !== 'CONFIRM') return
    setIsDeleting(true)
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' })
      if (res.ok) {
        localStorage.clear()
        sessionStorage.clear()
        router.push('/')
      } else {
        alert('Failed to delete profile.')
      }
    } catch (err) {
      console.error(err)
      alert('Error deleting profile.')
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
    }
  }

  // ─── Tab trap ────────────────────────────────────────────────────────────────

  function handleModalKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return
    const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, input, select, [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable || focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  // ─── Trigger Button ──────────────────────────────────────────────────────────

  const trigger = (
    <button
      ref={triggerRef}
      id="profile-modal-trigger"
      onClick={open}
      aria-label="Open profile settings"
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      className="
        group relative w-12 h-12 rounded-full flex items-center justify-center
        ring-2 ring-orange-500/20 hover:ring-orange-500 ring-offset-2 transition-all duration-200
        hover:scale-105 active:scale-95 bg-gray-50 overflow-hidden
        focus:outline-none focus-visible:ring-[#FF5C00]
      "
    >
      <img
        src={activeAvatar.src}
        alt={activeAvatar.name}
        className="w-full h-full rounded-full object-cover scale-115 transition-transform duration-200"
      />
    </button>
  )

  return (
    <>
      {trigger}

      {isOpen && (
        /* ─── Backdrop ──────────────────────────────────────────────────────── */
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          {/* Blurred overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />

          {/* ─── Modal Panel ─────────────────────────────────────────────────── */}
          <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            onKeyDown={handleModalKeyDown}
            className="
              relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl
              overflow-hidden min-h-[480px] flex flex-col
              animate-in fade-in zoom-in-95 duration-200
            "
          >
            {/* ─── Nested Avatar Selection View ───────────────────────────────── */}
            {isAvatarGalleryOpen ? (
              <div className="absolute inset-0 z-20 bg-white flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <button
                    type="button"
                    onClick={handleCancelAvatar}
                    aria-label="Cancel avatar selection"
                    className="
                      p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                      transition-colors duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]
                    "
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>

                  <h3 className="text-sm font-semibold text-gray-900 tracking-tight">
                    Choose Avatar
                  </h3>

                  <button
                    type="button"
                    onClick={handleSaveAvatar}
                    className="
                      px-3 py-1 text-sm font-semibold text-[#FF5C00] hover:text-[#e04e00]
                      hover:bg-orange-50 rounded-lg transition-colors duration-150
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]
                    "
                  >
                    Save
                  </button>
                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 mx-5" />

                {/* Body */}
                <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 space-y-8">
                  {/* Center: Large Preview */}
                  <div className="relative">
                    <img
                      src={previewAvatarOption.src}
                      alt={previewAvatarOption.name}
                      className="w-28 h-28 rounded-full object-contain bg-gray-50 shadow-sm border border-gray-100 ring-4 ring-orange-500/20 transition-all duration-200"
                    />
                  </div>

                  {/* Bottom: Horizontal scrollable row */}
                  <div
                    role="radiogroup"
                    aria-label="Choose avatar"
                    className="flex items-center gap-3 overflow-x-auto py-2 px-2 w-full justify-start sm:justify-center scrollbar-none"
                  >
                    {AVATARS.map((av) => {
                      const isSelected = av.id === previewAvatar
                      return (
                        <button
                          key={av.id}
                          type="button"
                          id={`nested-avatar-option-${av.id}`}
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`Avatar: ${av.name}`}
                          onClick={() => setPreviewAvatar(av.id)}
                          className={`
                            relative flex-shrink-0 rounded-full transition-all duration-150
                            hover:scale-105 active:scale-95 focus:outline-none
                            ${isSelected
                              ? 'ring-2 ring-orange-500 ring-offset-2'
                              : 'hover:ring-2 hover:ring-gray-300'
                            }
                          `}
                        >
                          <img
                            src={av.src}
                            alt={av.name}
                            className="w-14 h-14 rounded-full object-contain bg-gray-50"
                          />
                          {isSelected && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                              <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* ─── Main Profile View ──────────────────────────────────────────── */}
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              {/* Close */}
              <button
                ref={firstFocusRef}
                id="profile-modal-close"
                onClick={close}
                aria-label="Close profile settings"
                className="
                  p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100
                  transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]
                "
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>

              <h2
                id="profile-modal-title"
                className="text-sm font-semibold text-gray-900 tracking-tight"
              >
                Your Profile
              </h2>

              {/* Sign out */}
              <button
                id="profile-modal-signout"
                onClick={onSignOut}
                aria-label="Sign out"
                className="
                  p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50
                  transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                "
              >
                <LogOut className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 mx-5" />

            {/* Scrollable body */}
            <div className="px-5 py-5 overflow-y-auto max-h-[calc(90vh-5rem)] space-y-6 flex-1">
              {/* Avatar section: Large Active Avatar with Pencil Edit Badge */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={openAvatarGallery}
                  aria-label="Change profile avatar"
                  className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2 transition-transform active:scale-95"
                >
                  <img
                    src={activeAvatar.src}
                    alt={activeAvatar.name}
                    className="w-24 h-24 rounded-full object-contain bg-gray-50 shadow-sm border border-gray-100 ring-2 ring-orange-500/20 group-hover:ring-orange-500 transition-all duration-200"
                  />
                  <span
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 group-hover:text-[#FF5C00] group-hover:border-orange-200 transition-colors"
                    title="Edit avatar"
                  >
                    <Pencil className="w-4 h-4" strokeWidth={2} />
                  </span>
                </button>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                {/* Full name input */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-name-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={50}
                    className="
                      w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 bg-gray-50
                      border border-gray-200
                      placeholder:text-gray-400
                      transition-colors duration-150
                      focus:outline-none focus:bg-white focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00]
                    "
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-email-display"
                    className="block text-xs font-semibold uppercase tracking-wider text-gray-400"
                  >
                    Email
                  </label>
                  <input
                    id="profile-email-display"
                    type="email"
                    value={email}
                    readOnly
                    aria-describedby="profile-email-hint"
                    className="
                      w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-500 bg-gray-100
                      border border-gray-200 cursor-not-allowed select-all
                      focus:outline-none
                    "
                  />
                  <p id="profile-email-hint" className="text-xs text-gray-400">
                    Email cannot be changed.
                  </p>
                </div>

                {/* Save button */}
                <button
                  id="profile-save-button"
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className={`
                    w-full py-2.5 rounded-lg text-sm font-semibold text-white
                    transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2
                    disabled:opacity-40 disabled:cursor-not-allowed
                    active:scale-[0.98]
                    ${saved
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-[#FF5C00] hover:bg-[#e04e00]'
                    }
                  `}
                >
                  {isSaving
                    ? 'Saving...'
                    : saved
                      ? '✓ Saved'
                      : 'Save Changes'}
                </button>
              </div>

              {/* Danger Zone */}
              <div className="border border-red-200 bg-red-50/30 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">
                  Danger Zone
                </p>

                {/* Unclaim Tag */}
                <button
                  id="profile-unclaim-tags-button"
                  onClick={openUnclaimModal}
                  className="
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                    text-red-600 border border-red-200 bg-white
                    hover:bg-red-50 hover:border-red-300
                    transition-colors duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
                    active:scale-[0.98]
                  "
                >
                  <Tag className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span>Unclaim Tag</span>
                </button>

                {/* Delete Profile */}
                <button
                  id="profile-delete-button"
                  onClick={openDeleteModal}
                  className="
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
                    text-white bg-red-600 border border-red-700
                    hover:bg-red-700
                    transition-colors duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1
                    active:scale-[0.98]
                  "
                >
                  <Trash2 className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
                  <span>Delete Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {unclaimModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-semibold text-gray-900">Unclaim Tag</h3>
            <p className="text-sm text-gray-500">
              Select a tag to unclaim. This will reset its metadata and it will become available for anyone to claim again.
            </p>
            {isLoadingTags ? (
              <p className="text-sm text-gray-400">Loading your tags...</p>
            ) : userTags.length === 0 ? (
              <p className="text-sm text-red-500">You don't own any tags.</p>
            ) : (
              <select
                value={selectedTagToUnclaim}
                onChange={(e) => setSelectedTagToUnclaim(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C00]"
              >
                {userTags.map((tag) => (
                  <option key={tag.tag_id} value={tag.tag_id}>
                    {tag.tag_id} (Mode: {tag.active_mode})
                  </option>
                ))}
              </select>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type <span className="font-bold text-gray-900">CONFIRM</span> to proceed
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="CONFIRM"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setUnclaimModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitUnclaimTag}
                disabled={confirmText !== 'CONFIRM' || isUnclaiming || userTags.length === 0}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUnclaiming ? 'Unclaiming...' : 'Unclaim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95">
            <h3 className="text-lg font-semibold text-gray-900">Delete Profile</h3>
            <p className="text-sm text-gray-500">
              This action is permanent and cannot be undone. All your data will be wiped.
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Type <span className="font-bold text-gray-900">CONFIRM</span> to proceed
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="CONFIRM"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitDeleteProfile}
                disabled={confirmText !== 'CONFIRM' || isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
