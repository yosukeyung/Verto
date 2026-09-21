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
        label="Nama Lengkap"
        required
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="Nama Anda"
      />
      <Input
        id="social-bio"
        label="Bio / Keterangan"
        value={data.bio || ''}
        onChange={(e) => onChange({ ...data, bio: e.target.value })}
        placeholder="Mahasiswa Ilmu Komputer / Designer"
      />
      <Input
        id="social-wa"
        label="Nomor WhatsApp"
        value={data.wa || ''}
        onChange={(e) => onChange({ ...data, wa: e.target.value })}
        placeholder="6281234567890"
        helperText="Gunakan kode negara tanpa +, contoh: 6281234567890"
      />
      <Input
        id="social-ig"
        label="Username Instagram"
        value={data.ig || ''}
        onChange={(e) => onChange({ ...data, ig: e.target.value.replace(/^@/, '') })}
        placeholder="username"
        helperText="Masukkan username tanpa tanda @"
      />
      <Input
        id="social-linkedin"
        label="Tautan LinkedIn"
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
        label="Nama Barang"
        required
        value={data.item_name || ''}
        onChange={(e) => onChange({ ...data, item_name: e.target.value })}
        placeholder="Contoh: Kunci Motor Vario / Dompet Kulit Cokelat"
        helperText="Barang fisik yang dipasangi tag NFC ini"
      />
      <Input
        id="lf-owner-name"
        label="Nama Pemilik"
        required
        value={data.owner_name || ''}
        onChange={(e) => onChange({ ...data, owner_name: e.target.value })}
        placeholder="Nama pemilik barang"
      />
      <Input
        id="lf-wa-number"
        label="Nomor WhatsApp Pemilik"
        required
        value={data.wa_number || ''}
        onChange={(e) => onChange({ ...data, wa_number: e.target.value })}
        placeholder="6281234567890"
        helperText="Nomor yang dihubungi finder saat menekan tombol WhatsApp"
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
        label="Judul Acara"
        required
        value={data.title || ''}
        onChange={(e) => onChange({ ...data, title: e.target.value })}
        placeholder="Contoh: Seminar Nasional Teknologi 2026"
      />
      <Input
        id="event-description"
        label="Deskripsi Acara"
        required
        value={data.description || ''}
        onChange={(e) => onChange({ ...data, description: e.target.value })}
        placeholder="Waktu, lokasi, dan penjelasan singkat acara"
      />
      <Input
        id="event-link-1"
        label="Tautan 1"
        type="url"
        value={data.link_1 || ''}
        onChange={(e) => onChange({ ...data, link_1: e.target.value })}
        placeholder="https://..."
        helperText="Label tombol akan otomatis diambil dari hostname link"
      />
      <Input
        id="event-link-2"
        label="Tautan 2"
        type="url"
        value={data.link_2 || ''}
        onChange={(e) => onChange({ ...data, link_2: e.target.value })}
        placeholder="https://..."
      />
      <Input
        id="event-link-3"
        label="Tautan 3"
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
