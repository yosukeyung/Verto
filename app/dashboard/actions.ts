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
import { sanitizeBackgroundPattern, sanitizeBackgroundStyle } from '@/lib/tag-theme'
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
const VALID_THEME_FONTS = new Set(['sans', 'serif', 'mono'])
const VALID_THEME_COLORS = new Set(['orange', 'emerald', 'blue'])
const MAX_METADATA_BYTES = 16_384

const FIELD_MAX_LENGTHS = {
  name: 100,
  bio: 300,
  wa: 25,
  linkedin: 300,
  item_name: 100,
  owner_name: 100,
  wa_number: 25,
  custom_message: 500,
  item_photo_url: 500,
  title: 120,
  description: 1000,
  link: 500,
  link_title: 80,
} as const

function sanitizeBoundedText(
  raw: unknown,
  maxLen: number
): { value: string | null; tooLong: boolean; invalidType: boolean } {
  if (raw === undefined || raw === null || raw === '') {
    return { value: null, tooLong: false, invalidType: false }
  }
  if (typeof raw !== 'string') {
    return { value: null, tooLong: false, invalidType: true }
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    return { value: null, tooLong: false, invalidType: false }
  }
  if (trimmed.length > maxLen) {
    return { value: null, tooLong: true, invalidType: false }
  }
  return { value: trimmed, tooLong: false, invalidType: false }
}

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

  // Validate active mode required & bounded text fields first
  const socialName = sanitizeBoundedText(metadata.name, FIELD_MAX_LENGTHS.name)
  const socialBio = sanitizeBoundedText(metadata.bio, FIELD_MAX_LENGTHS.bio)
  const socialWa = sanitizeBoundedText(metadata.wa, FIELD_MAX_LENGTHS.wa)

  const lfItemName = sanitizeBoundedText(metadata.item_name ?? metadata.itemName, FIELD_MAX_LENGTHS.item_name)
  const lfOwnerName = sanitizeBoundedText(metadata.owner_name ?? metadata.ownerName, FIELD_MAX_LENGTHS.owner_name)
  const lfWaNumber = sanitizeBoundedText(metadata.wa_number ?? metadata.waNumber, FIELD_MAX_LENGTHS.wa_number)
  const lfCustomMsg = sanitizeBoundedText(metadata.custom_message ?? metadata.customMessage, FIELD_MAX_LENGTHS.custom_message)

  const evTitle = sanitizeBoundedText(metadata.title ?? metadata.eventTitle, FIELD_MAX_LENGTHS.title)
  const evDescription = sanitizeBoundedText(metadata.description ?? metadata.eventDescription, FIELD_MAX_LENGTHS.description)

  if (activeMode === 'social') {
    if (socialName.invalidType || !socialName.value) {
      return { error: `Full Name is required for Social Mode (up to ${FIELD_MAX_LENGTHS.name} characters).` }
    }
    if (socialName.tooLong) {
      return { error: `Full Name must be ${FIELD_MAX_LENGTHS.name} characters or fewer.` }
    }
    if (socialBio.invalidType || socialBio.tooLong) {
      return { error: `Bio must be ${FIELD_MAX_LENGTHS.bio} characters or fewer.` }
    }
    if (socialWa.invalidType || socialWa.tooLong) {
      return { error: `WhatsApp number must be ${FIELD_MAX_LENGTHS.wa} characters or fewer.` }
    }
  } else if (activeMode === 'lost_and_found') {
    if (lfItemName.invalidType || !lfItemName.value) {
      return { error: `Item Name is required (up to ${FIELD_MAX_LENGTHS.item_name} characters).` }
    }
    if (lfOwnerName.invalidType || !lfOwnerName.value) {
      return { error: `Owner Name is required (up to ${FIELD_MAX_LENGTHS.owner_name} characters).` }
    }
    if (lfWaNumber.invalidType || !lfWaNumber.value) {
      return { error: `WhatsApp Number is required (up to ${FIELD_MAX_LENGTHS.wa_number} characters).` }
    }
    if (lfItemName.tooLong || lfOwnerName.tooLong || lfWaNumber.tooLong) {
      return { error: 'One or more Lost & Found fields exceed the maximum allowed length.' }
    }
    if (lfCustomMsg.invalidType || lfCustomMsg.tooLong) {
      return { error: `Custom Message must be ${FIELD_MAX_LENGTHS.custom_message} characters or fewer.` }
    }
  } else if (activeMode === 'event_hub') {
    if (evTitle.invalidType || !evTitle.value) {
      return { error: `Event Title is required (up to ${FIELD_MAX_LENGTHS.title} characters).` }
    }
    if (evDescription.invalidType || !evDescription.value) {
      return { error: `Event Description is required (up to ${FIELD_MAX_LENGTHS.description} characters).` }
    }
    if (evTitle.tooLong) {
      return { error: `Event Title must be ${FIELD_MAX_LENGTHS.title} characters or fewer.` }
    }
    if (evDescription.tooLong) {
      return { error: `Event Description must be ${FIELD_MAX_LENGTHS.description} characters or fewer.` }
    }
  }

  // Construct metadata strictly from allowlisted keys (never spread untrusted object)
  const rawThemeFont = typeof metadata.theme_font === 'string' ? metadata.theme_font : 'sans'
  const themeFont = VALID_THEME_FONTS.has(rawThemeFont) ? rawThemeFont : 'sans'

  const rawThemeColor = typeof metadata.theme_color === 'string' ? metadata.theme_color : 'orange'
  const themeColor = VALID_THEME_COLORS.has(rawThemeColor) ? rawThemeColor : 'orange'

  const pageTheme = (metadata.page_theme || metadata.pageTheme) === 'dark' ? 'dark' : 'light'
  const isDarkTheme = pageTheme === 'dark'

  const sanitizedMetadata: Record<string, string | null> = {
    theme_font: themeFont,
    theme_color: themeColor,
    page_theme: pageTheme,
    background_style: sanitizeBackgroundStyle(
      metadata.background_style ?? metadata.bg_preset,
      isDarkTheme
    ),
    background_pattern: sanitizeBackgroundPattern(
      metadata.background_pattern ?? metadata.bg_pattern
    ),
    name: socialName.value,
    bio: socialBio.value,
    wa: socialWa.value,
    ig: null,
    linkedin: null,
    item_name: lfItemName.value,
    owner_name: lfOwnerName.value,
    wa_number: lfWaNumber.value,
    custom_message: lfCustomMsg.value,
    item_photo_url: null,
    title: evTitle.value,
    description: evDescription.value,
    link_1: null,
    link_2: null,
    link_3: null,
    link_1_title: null,
    link_2_title: null,
    link_3_title: null,
  }

  const rawPhoto = metadata.item_photo_url ?? metadata.itemPhotoUrl
  if (typeof rawPhoto === 'string' && rawPhoto.trim().length > 0) {
    const validPhoto = sanitizeAvatarStorageUrl(rawPhoto, { expectedUserId: user.id })
    if (!validPhoto || validPhoto.length > FIELD_MAX_LENGTHS.item_photo_url) {
      if (activeMode === 'lost_and_found') {
        return { error: 'Invalid item photo URL.' }
      }
    } else {
      sanitizedMetadata.item_photo_url = validPhoto
    }
  } else if (rawPhoto != null && rawPhoto !== '' && activeMode === 'lost_and_found') {
    return { error: 'Invalid item photo URL.' }
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
    } else {
      sanitizedMetadata.ig = validIg
    }
  } else if (metadata.ig != null && metadata.ig !== '' && activeMode === 'social') {
    return {
      error:
        'Invalid Instagram username. Use 1–30 letters, numbers, periods, or underscores.',
    }
  }

  if (typeof metadata.linkedin === 'string' && metadata.linkedin.trim().length > 0) {
    const validLinkedin = sanitizeLinkedInUrl(metadata.linkedin)
    if (!validLinkedin || validLinkedin.length > FIELD_MAX_LENGTHS.linkedin) {
      if (activeMode === 'social') {
        return { error: 'Invalid LinkedIn URL. Must be an https://linkedin.com link.' }
      }
    } else {
      sanitizedMetadata.linkedin = validLinkedin
    }
  } else if (metadata.linkedin != null && metadata.linkedin !== '' && activeMode === 'social') {
    return { error: 'Invalid LinkedIn URL. Must be an https://linkedin.com link.' }
  }

  for (const [linkKey, titleKey, legacyTitleKey] of [
    ['link_1', 'link_1_title', 'link1_title'],
    ['link_2', 'link_2_title', 'link2_title'],
    ['link_3', 'link_3_title', 'link3_title'],
  ] as const) {
    const rawLink = metadata[linkKey]
    if (typeof rawLink === 'string' && rawLink.trim().length > 0) {
      const validLink = sanitizeHttpsUrl(rawLink)
      if (!validLink || validLink.length > FIELD_MAX_LENGTHS.link) {
        if (activeMode === 'event_hub') {
          return { error: 'Event links must be valid https:// URLs.' }
        }
      } else {
        sanitizedMetadata[linkKey] = validLink
      }
    } else if (rawLink != null && rawLink !== '' && activeMode === 'event_hub') {
      return { error: 'Event links must be valid https:// URLs.' }
    }

    const parsedTitle = sanitizeBoundedText(
      metadata[titleKey] ?? metadata[legacyTitleKey],
      FIELD_MAX_LENGTHS.link_title
    )
    if ((parsedTitle.invalidType || parsedTitle.tooLong) && activeMode === 'event_hub') {
      return { error: `Button Title must be ${FIELD_MAX_LENGTHS.link_title} characters or fewer.` }
    }
    sanitizedMetadata[titleKey] = parsedTitle.value
  }

  if (Buffer.byteLength(JSON.stringify(sanitizedMetadata), 'utf8') > MAX_METADATA_BYTES) {
    return { error: 'Settings data exceeds the maximum allowed size.' }
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
