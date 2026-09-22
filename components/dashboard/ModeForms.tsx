import React from 'react'
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
      <Input
        id="event-link-1"
        label="Link 1"
        type="url"
        value={data.link_1 || ''}
        onChange={(e) => onChange({ ...data, link_1: e.target.value })}
        placeholder="https://..."
        helperText="Button label is automatically derived from the link hostname"
      />
      <Input
        id="event-link-2"
        label="Link 2"
        type="url"
        value={data.link_2 || ''}
        onChange={(e) => onChange({ ...data, link_2: e.target.value })}
        placeholder="https://..."
      />
      <Input
        id="event-link-3"
        label="Link 3"
        type="url"
        value={data.link_3 || ''}
        onChange={(e) => onChange({ ...data, link_3: e.target.value })}
        placeholder="https://..."
      />
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
