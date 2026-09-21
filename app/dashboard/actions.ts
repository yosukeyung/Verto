'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { ActiveMode, TagRow } from '@/types/database'

export async function claimTag(tagId: string) {
  const cleanId = tagId.trim()
  if (!cleanId) {
    return { error: 'ID tag tidak valid.' }
  }

  if (cleanId === '000') {
    return { error: 'Tag 000 adalah tag reservasi Super Admin.' }
  }

  const supabaseUser = await createClient()
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

  if (authError || !user) {
    return { error: 'Sesi telah berakhir. Silakan masuk kembali.' }
  }

  // Service client needed because unclaimed tags have owner_id = null (bypasses RLS)
  const serviceClient = await createServiceClient()

  const { data: tag, error: fetchError } = await serviceClient
    .from('tags')
    .select('*')
    .eq('tag_id', cleanId)
    .single()

  if (fetchError || !tag) {
    return { error: `Tag dengan ID "${cleanId}" tidak ditemukan dalam sistem.` }
  }

  const tagRow = tag as TagRow

  if (tagRow.owner_id && tagRow.owner_id !== user.id) {
    return { error: 'Tag ini sudah didaftarkan oleh akun lain.' }
  }

  const { error: updateError } = await (serviceClient.from('tags') as any)
    .update({
      owner_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq('tag_id', cleanId)

  if (updateError) {
    return { error: 'Gagal mengklaim tag: ' + updateError.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveTagSettings(
  tagId: string,
  activeMode: ActiveMode,
  metadata: Record<string, any>
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Sesi telah berakhir. Silakan masuk kembali.' }
  }

  // Validation according to mode
  if (activeMode === 'social') {
    if (!metadata.name?.trim()) {
      return { error: 'Nama Lengkap wajib diisi pada Social Mode.' }
    }
  } else if (activeMode === 'lost_and_found') {
    if (!metadata.item_name?.trim() || !metadata.owner_name?.trim() || !metadata.wa_number?.trim()) {
      return { error: 'Nama Barang, Nama Pemilik, dan Nomor WhatsApp wajib diisi.' }
    }
  } else if (activeMode === 'event_hub') {
    if (!metadata.title?.trim() || !metadata.description?.trim()) {
      return { error: 'Judul dan Deskripsi Acara wajib diisi.' }
    }
  }

  const { error: updateError } = await (supabase.from('tags') as any)
    .update({
      active_mode: activeMode,
      metadata: metadata,
      updated_at: new Date().toISOString(),
    })
    .eq('tag_id', tagId)
    .eq('owner_id', user.id)

  if (updateError) {
    return { error: 'Gagal menyimpan pengaturan: ' + updateError.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/t/${tagId}`)
  return { success: true }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
