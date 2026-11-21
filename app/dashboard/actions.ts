'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isReservedTagId, isValidTagId, normalizeTagId } from '@/lib/tag-id'
import {
  sanitizeAvatarStorageUrl,
  sanitizeHttpsUrl,
  sanitizeInstagramHandle,
  sanitizeLinkedInUrl,
} from '@/lib/url-validation'
import {
  getNextDefaultTagName,
  sanitizeTagLabel,
  TAG_LABEL_MAX_LENGTH,
} from '@/lib/tag-label'
import type { ActiveMode } from '@/types/database'

export async function claimTag(tagId: string, rawTagLabel?: string) {
  const cleanId = normalizeTagId(tagId)
  if (!cleanId) {
    return { error: 'Invalid tag ID.' }
  }

  if (isReservedTagId(cleanId)) {
    return { error: 'This tag cannot be claimed.' }
  }

  if (rawTagLabel !== undefined && typeof rawTagLabel !== 'string') {
    return { error: 'Invalid tag name.' }
  }

  if (
    typeof rawTagLabel === 'string' &&
    rawTagLabel.replace(/[\r\n\t]+/g, ' ').trim().length > TAG_LABEL_MAX_LENGTH
  ) {
    return { error: 'Tag Name must be 50 characters or fewer.' }
  }

  const supabaseUser = await createClient()
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()

  if (authError || !user) {
    return { error: 'Session expired. Please sign in again.' }
  }

  // Service client needed because unclaimed tags have owner_id = null (bypasses RLS)
  const serviceClient = await createServiceClient()

  let resolvedLabel = sanitizeTagLabel(rawTagLabel)
  if (!resolvedLabel) {
    const { data: ownedTags } = await serviceClient
      .from('tags')
      .select('label')
      .eq('owner_id', user.id)

    resolvedLabel = getNextDefaultTagName(
      (ownedTags ?? []).map((t: { label?: string | null }) => t.label)
    )
  }

  const { data: claimedTag, error: updateError } = await (serviceClient.from('tags') as any)
    .update({
      owner_id: user.id,
      label: resolvedLabel,
      updated_at: new Date().toISOString(),
    })
    .eq('tag_id', cleanId)
    .is('owner_id', null)
    .select('tag_id')
    .maybeSingle()

  if (updateError) {
    console.error('[claimTag] update error:', updateError)
    return { error: 'Unable to claim this tag right now. Please try again.' }
  }

  if (claimedTag) {
    revalidatePath('/dashboard')
    revalidatePath(`/t/${cleanId}`)
    return { success: true }
  }

  const { data: existingTag, error: checkError } = await (serviceClient.from('tags') as any)
    .select('owner_id')
    .eq('tag_id', cleanId)
    .maybeSingle()

  if (checkError) {
    console.error('[claimTag] check error:', checkError)
    return { error: 'Unable to claim this tag right now. Please try again.' }
  }

  if (existingTag && existingTag.owner_id === user.id) {
    revalidatePath('/dashboard')
    return { success: true }
  }

  return { error: 'This tag is unavailable or cannot be claimed.' }
}

const VALID_ACTIVE_MODES: readonly ActiveMode[] = ['social', 'lost_and_found', 'event_hub']

export async function saveTagSettings(
  tagId: string,
  activeMode: ActiveMode,
  metadata: Record<string, any>,
  rawTagLabel?: string
) {
  if (!isValidTagId(tagId)) {
    return { error: 'Invalid tag ID.' }
  }

  if (!VALID_ACTIVE_MODES.includes(activeMode)) {
    return { error: 'Invalid tag mode.' }
  }

  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return { error: 'Invalid settings payload.' }
  }

  let validatedLabel: string | undefined
  if (rawTagLabel !== undefined) {
    const cleanLabel = sanitizeTagLabel(rawTagLabel)
    if (!cleanLabel) {
      return { error: 'Tag Name is required (up to 50 characters).' }
    }
    validatedLabel = cleanLabel
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'Session expired. Please sign in again.' }
  }

  // Validation according to mode
  if (activeMode === 'social') {
    if (typeof metadata.name !== 'string' || !metadata.name.trim()) {
      return { error: 'Full Name is required for Social Mode.' }
    }
  } else if (activeMode === 'lost_and_found') {
    if (
      typeof metadata.item_name !== 'string' ||
      !metadata.item_name.trim() ||
      typeof metadata.owner_name !== 'string' ||
      !metadata.owner_name.trim() ||
      typeof metadata.wa_number !== 'string' ||
      !metadata.wa_number.trim()
    ) {
      return { error: 'Item Name, Owner Name, and WhatsApp Number are required.' }
    }
  } else if (activeMode === 'event_hub') {
    if (
      typeof metadata.title !== 'string' ||
      !metadata.title.trim() ||
      typeof metadata.description !== 'string' ||
      !metadata.description.trim()
    ) {
      return { error: 'Event Title and Description are required.' }
    }
  }

  const sanitizedMetadata: Record<string, any> = { ...metadata }
  delete sanitizedMetadata.avatar_url
  delete sanitizedMetadata.avatar_id
  delete sanitizedMetadata.custom_avatar_url
  delete sanitizedMetadata.itemPhotoUrl

  const rawPhoto = metadata.item_photo_url ?? metadata.itemPhotoUrl
  if (typeof rawPhoto === 'string' && rawPhoto.trim().length > 0) {
    const validPhoto = sanitizeAvatarStorageUrl(rawPhoto, { expectedUserId: user.id })
    if (!validPhoto) {
      if (activeMode === 'lost_and_found') {
        return { error: 'Invalid item photo URL.' }
      }
      sanitizedMetadata.item_photo_url = null
    } else {
      sanitizedMetadata.item_photo_url = validPhoto
    }
  } else if (rawPhoto != null && rawPhoto !== '') {
    if (activeMode === 'lost_and_found') {
      return { error: 'Invalid item photo URL.' }
    }
    sanitizedMetadata.item_photo_url = null
  } else {
    sanitizedMetadata.item_photo_url = null
  }

  if (typeof metadata.ig === 'string' && metadata.ig.trim().length > 0) {
    const validIg = sanitizeInstagramHandle(metadata.ig)
    if (!validIg) {
      if (activeMode === 'social') {
        return {
          error:
            'Invalid Instagram username. Use 1–30 letters, numbers, periods, or underscores.',
        }
      }
      sanitizedMetadata.ig = null
    } else {
      sanitizedMetadata.ig = validIg
    }
  } else if (metadata.ig != null && metadata.ig !== '') {
    if (activeMode === 'social') {
      return {
        error:
          'Invalid Instagram username. Use 1–30 letters, numbers, periods, or underscores.',
      }
    }
    sanitizedMetadata.ig = null
  } else {
    sanitizedMetadata.ig = null
  }

  if (typeof metadata.linkedin === 'string' && metadata.linkedin.trim().length > 0) {
    const validLinkedin = sanitizeLinkedInUrl(metadata.linkedin)
    if (!validLinkedin) {
      if (activeMode === 'social') {
        return { error: 'Invalid LinkedIn URL. Must be an https://linkedin.com link.' }
      }
      sanitizedMetadata.linkedin = null
    } else {
      sanitizedMetadata.linkedin = validLinkedin
    }
  } else if (metadata.linkedin != null && metadata.linkedin !== '') {
    if (activeMode === 'social') {
      return { error: 'Invalid LinkedIn URL. Must be an https://linkedin.com link.' }
    }
    sanitizedMetadata.linkedin = null
  } else {
    sanitizedMetadata.linkedin = null
  }

  for (const key of ['link_1', 'link_2', 'link_3'] as const) {
    const rawLink = metadata[key]
    if (typeof rawLink === 'string' && rawLink.trim().length > 0) {
      const validLink = sanitizeHttpsUrl(rawLink)
      if (!validLink) {
        if (activeMode === 'event_hub') {
          return { error: 'Event links must be valid https:// URLs.' }
        }
        sanitizedMetadata[key] = null
      } else {
        sanitizedMetadata[key] = validLink
      }
    } else if (rawLink != null && rawLink !== '') {
      if (activeMode === 'event_hub') {
        return { error: 'Event links must be valid https:// URLs.' }
      }
      sanitizedMetadata[key] = null
    } else {
      sanitizedMetadata[key] = null
    }
  }

  const updatePayload: Record<string, unknown> = {
    active_mode: activeMode,
    metadata: sanitizedMetadata,
    updated_at: new Date().toISOString(),
  }
  if (validatedLabel !== undefined) {
    updatePayload.label = validatedLabel
  }

  const { data: updatedTag, error: updateError } = await (supabase.from('tags') as any)
    .update(updatePayload)
    .eq('tag_id', tagId)
    .eq('owner_id', user.id)
    .select('tag_id')
    .maybeSingle()

  if (updateError) {
    console.error('[saveTagSettings] update error:', updateError)
    return { error: 'Failed to save settings.' }
  }

  if (!updatedTag) {
    return { error: 'Tag not found or you do not have permission to edit it.' }
  }

  // Clean up orphaned item photo in storage when item_photo_url is cleared in Lost & Found mode
  if (activeMode === 'lost_and_found' && !sanitizedMetadata.item_photo_url) {
    const serviceClient = await createServiceClient()
    const { error: storageError } = await serviceClient.storage
      .from('avatars')
      .remove([`${user.id}/item_${tagId}.webp`])

    if (storageError) {
      console.error('[saveTagSettings] storage remove error:', storageError)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/t/${tagId}`)
  return { success: true }
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
