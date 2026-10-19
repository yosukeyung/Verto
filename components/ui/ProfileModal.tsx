'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  X,
  LogOut,
  Tag,
  Trash2,
  Check,
  Pencil,
} from 'lucide-react'
import { useUser } from '@/components/providers/UserContext'

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
  const { profile, updateProfile } = useUser()

  // ─── Portal mount guard (SSR safety) ─────────────────────────────────────────
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // ─── Local Draft Profile State ────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false)
  const [draftProfile, setDraftProfile] = useState<{ full_name: string; avatar_id: string }>({
    full_name: profile.full_name,
    avatar_id: profile.avatar_id,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isUnclaiming, setIsUnclaiming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Sync draftProfile with global profile whenever global profile updates (if modal is closed)
  useEffect(() => {
    if (!isOpen) {
      setDraftProfile({
        full_name: profile.full_name,
        avatar_id: profile.avatar_id,
      })
    }
  }, [profile.full_name, profile.avatar_id, isOpen])

  // Strict dirty state
  const hasChanges =
    draftProfile.full_name.trim() !== profile.full_name.trim() ||
    draftProfile.avatar_id !== profile.avatar_id

  // Nested Avatar Selection Pop-up State
  const [isAvatarGalleryOpen, setIsAvatarGalleryOpen] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState(profile.avatar_id || 'love')

  // Danger Zone Modals State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [unclaimModalOpen, setUnclaimModalOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [userTags, setUserTags] = useState<{ tag_id: string; active_mode: string }[]>([])
  const [selectedTagToUnclaim, setSelectedTagToUnclaim] = useState('')
  const [isLoadingTags, setIsLoadingTags] = useState(false)

  const triggerRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  // Confirmed avatar strictly isolated for Navbar trigger
  const confirmedAvatar = AVATARS.find((a) => a.id === profile.avatar_id) ?? AVATARS[0]
  // Draft avatar for local profile editor
  const draftAvatar = AVATARS.find((a) => a.id === draftProfile.avatar_id) ?? confirmedAvatar
  // Preview avatar for gallery modal
  const previewAvatarOption = AVATARS.find((a) => a.id === previewAvatar) ?? draftAvatar

  // ─── Body scroll-lock ─────────────────────────────────────────────────────────

  useEffect(() => {
    const anyOpen = isOpen || unclaimModalOpen || deleteModalOpen
    if (anyOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, unclaimModalOpen, deleteModalOpen])

  // ─── Open / close ─────────────────────────────────────────────────────────────

  const open = () => {
    setDraftProfile({
      full_name: profile.full_name,
      avatar_id: profile.avatar_id,
    })
    setSaved(false)
    setIsAvatarGalleryOpen(false)
    setIsOpen(true)
  }

  const close = useCallback(() => {
    setIsOpen(false)
    setIsAvatarGalleryOpen(false)
    setShowLogoutConfirm(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }, [])

  // ─── Keyboard: Escape to close ────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLogoutConfirm) {
          setShowLogoutConfirm(false)
        } else if (isAvatarGalleryOpen) {
          setIsAvatarGalleryOpen(false)
        } else {
          close()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, showLogoutConfirm, isAvatarGalleryOpen, close])

  // ─── Focus first element on open ─────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && !isAvatarGalleryOpen) {
      requestAnimationFrame(() => firstFocusRef.current?.focus())
    }
  }, [isOpen, isAvatarGalleryOpen])

  // ─── Avatar Gallery Handlers ──────────────────────────────────────────────────

  const openAvatarGallery = () => {
    setPreviewAvatar(draftProfile.avatar_id)
    setIsAvatarGalleryOpen(true)
  }

  const handleCancelAvatar = () => {
    setIsAvatarGalleryOpen(false)
  }

  const handleSaveAvatar = () => {
    // Strictly update the local draftProfile; do NOT update global UserContext
    setDraftProfile((prev) => ({ ...prev, avatar_id: previewAvatar }))
    setIsAvatarGalleryOpen(false)
  }

  // ─── Profile Handlers ─────────────────────────────────────────────────────────

  async function handleSave() {
    if (!hasChanges || isSaving || !draftProfile.full_name.trim()) return
    setIsSaving(true)
    try {
      const trimmedName = draftProfile.full_name.trim()
      const newAvatarId = draftProfile.avatar_id

      // 1. Run the Supabase update mutation
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: trimmedName, avatar_id: newAvatarId }),
      })

      if (res.ok) {
        // 2. Upon success, immediately update global User Context with finalized draftProfile
        updateProfile({
          full_name: trimmedName,
          avatar_id: newAvatarId,
        })

        // 3. Purge Next.js client-side router cache aggressively to prevent stale cache flicker
        router.refresh()

        // 4. Reset the dirty state
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
        window.location.reload()
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

  // ─── Tab trap ─────────────────────────────────────────────────────────────────

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

  // ─── Trigger Button ───────────────────────────────────────────────────────────

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
        ring-2 ring-orange-500/20 hover:ring-orange-500 ring-offset-2 dark:ring-offset-black transition-all duration-200
        hover:scale-105 active:scale-95 bg-gray-50 dark:bg-neutral-900 overflow-hidden
        focus:outline-none focus-visible:ring-[#FF5C00]
      "
    >
      <img
        src={confirmedAvatar.src}
        alt={confirmedAvatar.name}
        className="w-full h-full rounded-full object-cover scale-115 transition-transform duration-200"
      />
    </button>
  )

  // ─── Portal: Profile Modal ────────────────────────────────────────────────────

  const profileModal = mounted && isOpen ? createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-hidden="true"
        onClick={close}
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
        onKeyDown={handleModalKeyDown}
        onClick={(e) => e.stopPropagation()}
        className="
          relative z-10 w-full max-w-md bg-white dark:bg-neutral-950 dark:border dark:border-neutral-800 rounded-2xl shadow-2xl
          overflow-hidden max-h-[90dvh] flex flex-col
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* ─── Nested Avatar Selection View ─────────────────────────────────── */}
        {isAvatarGalleryOpen ? (
          <div className="absolute inset-0 z-20 bg-white dark:bg-neutral-950 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <button
                type="button"
                onClick={handleCancelAvatar}
                aria-label="Cancel avatar selection"
                className="
                  p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900
                  transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]
                "
              >
                <X className="w-4 h-4" strokeWidth={2} />
              </button>

              <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                Choose Avatar
              </h3>

              <button
                type="button"
                onClick={handleSaveAvatar}
                className="
                  px-3 py-1 text-sm font-semibold text-[#FF5C00] hover:text-[#e04e00]
                  hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg transition-colors duration-150
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]
                "
              >
                Done
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 dark:bg-neutral-800 mx-5" />

            {/* Body */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 py-6 space-y-8">
              {/* Large Preview */}
              <div className="relative">
                <img
                  src={previewAvatarOption.src}
                  alt={previewAvatarOption.name}
                  className="w-28 h-28 rounded-full object-contain bg-gray-50 dark:bg-neutral-900 shadow-sm border border-gray-100 dark:border-neutral-800 ring-4 ring-orange-500/20 transition-all duration-200"
                />
              </div>

              {/* Horizontal scrollable row */}
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
                          ? 'ring-2 ring-orange-500 ring-offset-2 dark:ring-offset-neutral-950'
                          : 'hover:ring-2 hover:ring-gray-300 dark:hover:ring-neutral-700'
                        }
                      `}
                    >
                      <img
                        src={av.src}
                        alt={av.name}
                        className="w-14 h-14 rounded-full object-contain bg-gray-50 dark:bg-neutral-900"
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

        {/* ─── Main Profile View ─────────────────────────────────────────────── */}
        {/* Header bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          {/* Close */}
          <button
            ref={firstFocusRef}
            id="profile-modal-close"
            onClick={close}
            aria-label="Close profile settings"
            className="
              p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]
            "
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>

          <h2
            id="profile-modal-title"
            className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight"
          >
            Your Profile
          </h2>

          {/* Sign out */}
          <button
            id="profile-modal-signout"
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Sign out"
            className="
              p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-300 dark:hover:bg-red-950/50
              transition-colors duration-150
              focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
            "
          >
            <LogOut className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-neutral-800 mx-5 flex-shrink-0" />

        {/* Scrollable body */}
        <div className="px-5 py-5 space-y-6 overflow-y-auto flex-1">
          {/* Avatar section */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={openAvatarGallery}
              aria-label="Change profile avatar"
              className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2 transition-transform active:scale-95"
            >
              <img
                src={draftAvatar.src}
                alt={draftAvatar.name}
                className="w-24 h-24 rounded-full object-contain bg-gray-50 dark:bg-neutral-900 shadow-sm border border-gray-100 dark:border-neutral-800 ring-2 ring-orange-500/20 group-hover:ring-orange-500 transition-all duration-200"
              />
              <span
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border border-gray-200 dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-300 shadow-sm flex items-center justify-center text-gray-600 group-hover:text-[#FF5C00] group-hover:border-orange-200 dark:group-hover:border-orange-500/50 transition-colors"
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
                className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-neutral-400"
              >
                Full Name
              </label>
              <input
                id="profile-name-input"
                type="text"
                value={draftProfile.full_name}
                onChange={(e) =>
                  setDraftProfile((prev) => ({ ...prev, full_name: e.target.value }))
                }
                placeholder="Enter your name"
                maxLength={50}
                className="
                  w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 bg-gray-50
                  border border-gray-200
                  placeholder:text-gray-400
                  dark:text-white dark:bg-neutral-900 dark:border-neutral-800 dark:placeholder:text-neutral-500
                  transition-colors duration-150
                  focus:outline-none focus:bg-white dark:focus:bg-black focus:border-[#FF5C00] focus:ring-1 focus:ring-[#FF5C00]
                "
              />
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-email-display"
                className="block text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-neutral-400"
              >
                Email
              </label>
              <input
                id="profile-email-display"
                type="email"
                value={profile.email}
                readOnly
                aria-describedby="profile-email-hint"
                className="
                  w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-500 bg-gray-100
                  border border-gray-200 cursor-not-allowed select-all
                  dark:text-neutral-400 dark:bg-neutral-900 dark:border-neutral-800
                  focus:outline-none
                "
              />
              <p id="profile-email-hint" className="text-xs text-gray-400 dark:text-neutral-500">
                Email cannot be changed.
              </p>
            </div>

            {/* Save button */}
            <button
              id="profile-save-button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving || !draftProfile.full_name.trim()}
              className={`
                w-full py-2.5 rounded-lg text-sm font-semibold text-white
                transition-all duration-200
                focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00] focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950
                active:scale-[0.98]
                ${saved
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : (!hasChanges || isSaving || !draftProfile.full_name.trim())
                    ? 'bg-[#FF5C00] opacity-50 cursor-not-allowed active:scale-100'
                    : 'bg-[#FF5C00] hover:bg-[#e04e00] shadow-sm'
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
          <div className="border border-red-200 bg-red-50/30 dark:border-red-900/60 dark:bg-red-950/20 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
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
                dark:text-red-400 dark:border-red-900 dark:bg-black dark:hover:bg-red-950/50 dark:hover:border-red-800
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
    </div>,
    document.body
  ) : null

  // ─── Portal: Unclaim Tag Modal ────────────────────────────────────────────────

  const unclaimModal = mounted && unclaimModalOpen ? createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) setUnclaimModalOpen(false) }}
    >
      <div
        className="bg-white dark:bg-neutral-950 dark:border dark:border-neutral-800 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unclaim Tag</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          Select a tag to unclaim. This will reset its metadata and it will become available for anyone to claim again.
        </p>
        {isLoadingTags ? (
          <p className="text-sm text-gray-400 dark:text-neutral-400">Loading your tags...</p>
        ) : userTags.length === 0 ? (
          <p className="text-sm text-red-500">You don&apos;t own any tags.</p>
        ) : (
          <select
            value={selectedTagToUnclaim}
            onChange={(e) => setSelectedTagToUnclaim(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5C00]"
          >
            {userTags.map((tag) => (
              <option key={tag.tag_id} value={tag.tag_id}>
                {tag.tag_id} (Mode: {tag.active_mode})
              </option>
            ))}
          </select>
        )}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
            Type <span className="font-bold text-gray-900 dark:text-white">CONFIRM</span> to proceed
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="CONFIRM"
            className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setUnclaimModalOpen(false)}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 rounded-lg text-sm font-medium transition-colors"
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
    </div>,
    document.body
  ) : null

  // ─── Portal: Delete Profile Modal ─────────────────────────────────────────────

  const deleteModal = mounted && deleteModalOpen ? createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) setDeleteModalOpen(false) }}
    >
      <div
        className="bg-white dark:bg-neutral-950 dark:border dark:border-neutral-800 rounded-xl shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Profile</h3>
        <p className="text-sm text-gray-500 dark:text-neutral-400">
          This action is permanent and cannot be undone. All your data will be wiped.
        </p>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">
            Type <span className="font-bold text-gray-900 dark:text-white">CONFIRM</span> to proceed
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="CONFIRM"
            className="w-full px-3 py-2 border border-gray-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setDeleteModalOpen(false)}
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 rounded-lg text-sm font-medium transition-colors"
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
    </div>,
    document.body
  ) : null

  // ─── Portal: Logout Confirmation Modal ───────────────────────────────────────

  const logoutConfirmModal = mounted && showLogoutConfirm ? createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
      role="presentation"
      onClick={(e) => { if (e.target === e.currentTarget) setShowLogoutConfirm(false) }}
    >
      <div
        className="bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-xl max-w-xs w-full p-5 space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          <h3
            id="logout-confirm-title"
            className="text-base font-semibold text-gray-900 dark:text-white"
          >
            Log Out
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 leading-normal">
            You will be signed out of your Verto account.
          </p>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(false)}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              setShowLogoutConfirm(false)
              if (onSignOut) {
                onSignOut()
              } else {
                router.push('/')
              }
            }}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {trigger}
      {profileModal}
      {unclaimModal}
      {deleteModal}
      {logoutConfirmModal}
    </>
  )
}
