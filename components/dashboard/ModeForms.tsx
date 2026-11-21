import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Trash2, X, Image as ImageIcon } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { AvatarCropper } from '@/components/ui/AvatarCropper'
import type {
  ActiveMode,
  SocialMetadata,
  LostAndFoundMetadata,
  EventHubMetadata
} from '@/types/database'

interface SocialFormProps {
  data: Partial<SocialMetadata>
  onChange: (data: Partial<SocialMetadata>) => void
}

export function SocialForm({ data, onChange }: SocialFormProps) {
  return (
    <div className="space-y-4">
      <Input
        id="social-name"
        label="Full Name"
        required
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="Your Name"
      />
      <Input
        id="social-bio"
        label="Bio / Headline"
        value={data.bio || ''}
        onChange={(e) => onChange({ ...data, bio: e.target.value })}
        placeholder="Software Engineer / Designer"
      />
      <Input
        id="social-wa"
        label="WhatsApp Number"
        value={data.wa || ''}
        onChange={(e) => onChange({ ...data, wa: e.target.value })}
        placeholder="6281234567890"
        helperText="Include country code without +, e.g. 6281234567890"
      />
      <Input
        id="social-ig"
        label="Instagram Username"
        value={data.ig || ''}
        onChange={(e) => onChange({ ...data, ig: e.target.value.replace(/^@/, '') })}
        placeholder="username"
        helperText="Enter username without the @ symbol"
      />
      <Input
        id="social-linkedin"
        label="LinkedIn URL"
        type="url"
        value={data.linkedin || ''}
        onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
        placeholder="https://linkedin.com/in/username"
      />
    </div>
  )
}

interface LostAndFoundFormProps {
  data: Partial<LostAndFoundMetadata>
  onChange: (data: Partial<LostAndFoundMetadata>) => void
  onStageItemPhoto?: (blob: Blob, previewUrl: string) => void
  onRemoveItemPhoto?: () => void
}

export function LostAndFoundForm({
  data,
  onChange,
  onStageItemPhoto,
  onRemoveItemPhoto,
}: LostAndFoundFormProps) {
  const [mounted, setMounted] = useState(false)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    return () => {
      if (cropperSrc) URL.revokeObjectURL(cropperSrc)
    }
  }, [cropperSrc])

  useEffect(() => {
    if (!cropperSrc) return
    document.body.style.overflow = 'hidden'
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        URL.revokeObjectURL(cropperSrc)
        setCropperSrc(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [cropperSrc])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null)
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/heic',
      'image/heif',
    ]
    const hasAllowedExt = /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name)
    if (!(allowedTypes.includes(file.type) || (!file.type && hasAllowedExt))) {
      setPhotoError('Unsupported format. Please select a JPEG, PNG, WebP, or HEIC image.')
      return
    }

    const maxBytes = 5 * 1024 * 1024
    if (file.size > maxBytes) {
      setPhotoError('File exceeds the 5 MB limit. Please choose a smaller image.')
      return
    }

    if (cropperSrc) URL.revokeObjectURL(cropperSrc)
    setCropperSrc(URL.createObjectURL(file))
  }

  const handleCropComplete = (blob: Blob) => {
    if (cropperSrc) {
      URL.revokeObjectURL(cropperSrc)
      setCropperSrc(null)
    }
    const previewUrl = URL.createObjectURL(blob)
    if (onStageItemPhoto) {
      onStageItemPhoto(blob, previewUrl)
    } else {
      onChange({ ...data, item_photo_url: previewUrl })
    }
  }

  const handleRemove = () => {
    setPhotoError(null)
    if (onRemoveItemPhoto) {
      onRemoveItemPhoto()
    } else {
      onChange({ ...data, item_photo_url: '' })
    }
  }

  const hasPhoto = Boolean(data.item_photo_url && data.item_photo_url.trim().length > 0)

  const cropModal =
    mounted && cropperSrc
      ? createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="presentation"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              aria-hidden="true"
              onClick={() => {
                URL.revokeObjectURL(cropperSrc)
                setCropperSrc(null)
              }}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Crop item photo"
              onClick={(e) => e.stopPropagation()}
              className="relative z-10 w-full max-w-md bg-white dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]"
            >
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(cropperSrc)
                    setCropperSrc(null)
                  }}
                  aria-label="Close cropper"
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={2} />
                </button>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-tight">
                  Crop Item Photo
                </h3>
                <div className="w-7" />
              </div>
              <div className="h-px bg-gray-100 dark:bg-neutral-800 mx-5" />
              <AvatarCropper
                imageSrc={cropperSrc}
                shape="square"
                outputSize={500}
                hintText="Drag to frame item inside square"
                onCancel={() => {
                  URL.revokeObjectURL(cropperSrc)
                  setCropperSrc(null)
                }}
                onComplete={handleCropComplete}
              />
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div className="space-y-4">
      <Input
        id="lf-item-name"
        label="Item Name"
        required
        value={data.item_name || ''}
        onChange={(e) => onChange({ ...data, item_name: e.target.value })}
        placeholder="e.g. Motorcycle Keys / Brown Leather Wallet"
        helperText="Physical item attached to this NFC tag"
      />
      <Input
        id="lf-owner-name"
        label="Owner Name"
        required
        value={data.owner_name || ''}
        onChange={(e) => onChange({ ...data, owner_name: e.target.value })}
        placeholder="Owner's Name"
      />
      <Input
        id="lf-wa-number"
        label="Owner WhatsApp Number"
        required
        value={data.wa_number || ''}
        onChange={(e) => onChange({ ...data, wa_number: e.target.value })}
        placeholder="6281234567890"
        helperText="Phone number contacted when the finder taps WhatsApp button"
      />
      <div className="w-full">
        <label
          htmlFor="lf-custom-message"
          className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1.5"
        >
          Custom Message (Optional)
        </label>
        <textarea
          id="lf-custom-message"
          value={data.custom_message || ''}
          onChange={(e) => onChange({ ...data, custom_message: e.target.value })}
          placeholder="e.g., Please return this to the campus security desk..."
          className="w-full h-24 p-3 rounded-lg border border-gray-200 text-base text-gray-900 placeholder:text-gray-400 bg-white dark:border-neutral-800 dark:text-white dark:placeholder:text-neutral-500 dark:bg-neutral-950 transition-colors duration-150 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
        />
      </div>

      {/* Optional Item Photo Upload */}
      <div className="w-full space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300">
          Item Photo (Optional)
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileChange}
          className="hidden"
        />

        {hasPhoto ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/60 dark:bg-neutral-950">
            <img
              src={data.item_photo_url || ''}
              alt="Item preview"
              className="w-16 h-16 rounded-lg object-cover border border-gray-200 dark:border-neutral-800 shrink-0"
            />
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-10 px-3.5 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs font-semibold text-gray-700 dark:text-neutral-200 hover:border-[#FF5C00] hover:text-[#FF5C00] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Change Photo</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="h-10 px-3.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-white dark:bg-neutral-900 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Remove Photo</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-11 px-4 rounded-xl border border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50/70 dark:bg-neutral-900/60 hover:border-[#FF5C00] hover:bg-orange-50/40 dark:hover:border-[#FF5C00] dark:hover:bg-orange-500/10 text-xs font-semibold text-gray-700 dark:text-neutral-200 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5C00]"
          >
            <Upload className="w-4 h-4 text-[#FF5C00]" strokeWidth={2} />
            <span>Upload Item Photo</span>
          </button>
        )}

        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Helps finders identify your item. JPEG, PNG, WebP, or HEIC up to 5 MB.
        </p>

        {photoError && (
          <p role="alert" className="text-xs text-red-600 dark:text-red-400 font-medium">
            {photoError}
          </p>
        )}
      </div>

      {cropModal}
    </div>
  )
}

interface EventHubFormProps {
  data: Partial<EventHubMetadata>
  onChange: (data: Partial<EventHubMetadata>) => void
}

export function EventHubForm({ data, onChange }: EventHubFormProps) {
  return (
    <div className="space-y-4">
      <Input
        id="event-title"
        label="Event Title"
        required
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="e.g. National Technology Symposium 2026"
      />
      <Input
        id="event-description"
        label="Event Description"
        required
        value={data.description || ''}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Time, location, and brief summary of the event"
      />

      {/* Link 1 */}
      <div className="space-y-2">
        <Input
          id="event-link-1"
          label="Link 1"
          type="url"
          value={data.link_1 || ''}
          onChange={(e) => onChange({ ...data, link_1: e.target.value })}
          placeholder="https://..."
        />
        <AnimatePresence>
          {Boolean(data.link_1?.trim()) && (
            <motion.div
              key="event-link-1-title-wrapper"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pl-3 border-l-2 border-orange-500/40 dark:border-orange-500/30 pt-1 pb-0.5">
                <Input
                  id="event-link-1-title"
                  label="Button Title (Optional)"
                  value={data.link_1_title || data.link1_title || ''}
                  onChange={(e) => onChange({ ...data, link_1_title: e.target.value })}
                  placeholder="e.g., Presentation Slides / Watch Video"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Link 2 */}
      <div className="space-y-2">
        <Input
          id="event-link-2"
          label="Link 2"
          type="url"
          value={data.link_2 || ''}
          onChange={(e) => onChange({ ...data, link_2: e.target.value })}
          placeholder="https://..."
        />
        <AnimatePresence>
          {Boolean(data.link_2?.trim()) && (
            <motion.div
              key="event-link-2-title-wrapper"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pl-3 border-l-2 border-orange-500/40 dark:border-orange-500/30 pt-1 pb-0.5">
                <Input
                  id="event-link-2-title"
                  label="Button Title (Optional)"
                  value={data.link_2_title || data.link2_title || ''}
                  onChange={(e) => onChange({ ...data, link_2_title: e.target.value })}
                  placeholder="e.g., Presentation Slides / Watch Video"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Link 3 */}
      <div className="space-y-2">
        <Input
          id="event-link-3"
          label="Link 3"
          type="url"
          value={data.link_3 || ''}
          onChange={(e) => onChange({ ...data, link_3: e.target.value })}
          placeholder="https://..."
        />
        <AnimatePresence>
          {Boolean(data.link_3?.trim()) && (
            <motion.div
              key="event-link-3-title-wrapper"
              initial={{ opacity: 0, height: 0, y: -8 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="pl-3 border-l-2 border-orange-500/40 dark:border-orange-500/30 pt-1 pb-0.5">
                <Input
                  id="event-link-3-title"
                  label="Button Title (Optional)"
                  value={data.link_3_title || data.link3_title || ''}
                  onChange={(e) => onChange({ ...data, link_3_title: e.target.value })}
                  placeholder="e.g., Presentation Slides / Watch Video"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

interface ModeFormDispatcherProps {
  activeMode: ActiveMode
  metadata: Record<string, any>
  onChangeMetadata: (metadata: Record<string, any>) => void
  onStageItemPhoto?: (blob: Blob, previewUrl: string) => void
  onRemoveItemPhoto?: () => void
}

export function ModeFormDispatcher({
  activeMode,
  metadata,
  onChangeMetadata,
  onStageItemPhoto,
  onRemoveItemPhoto,
}: ModeFormDispatcherProps) {
  if (activeMode === 'social') {
    return <SocialForm data={metadata} onChange={onChangeMetadata} />
  }
  if (activeMode === 'lost_and_found') {
    return (
      <LostAndFoundForm
        data={metadata}
        onChange={onChangeMetadata}
        onStageItemPhoto={onStageItemPhoto}
        onRemoveItemPhoto={onRemoveItemPhoto}
      />
    )
  }
  if (activeMode === 'event_hub') {
    return <EventHubForm data={metadata} onChange={onChangeMetadata} />
  }
  return null
}
