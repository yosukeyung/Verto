import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/Input'
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
}

export function LostAndFoundForm({ data, onChange }: LostAndFoundFormProps) {
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
}

export function ModeFormDispatcher({
  activeMode,
  metadata,
  onChangeMetadata,
}: ModeFormDispatcherProps) {
  if (activeMode === 'social') {
    return <SocialForm data={metadata} onChange={onChangeMetadata} />
  }
  if (activeMode === 'lost_and_found') {
    return <LostAndFoundForm data={metadata} onChange={onChangeMetadata} />
  }
  if (activeMode === 'event_hub') {
    return <EventHubForm data={metadata} onChange={onChangeMetadata} />
  }
  return null
}
