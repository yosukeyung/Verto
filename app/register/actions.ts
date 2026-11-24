'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getClientIpFromHeaders } from '@/lib/client-ip'
import { consumeActionRateLimit } from '@/lib/action-rate-limit'
import { isReservedTagId, normalizeTagId } from '@/lib/tag-id'
import { sanitizeTagLabel, TAG_LABEL_MAX_LENGTH } from '@/lib/tag-label'

const AVATAR_IDS = ['love', 'eat', 'sleep', 'angry', 'cry', 'study'] as const
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const REGISTER_WINDOW_MS = 15 * 60 * 1000
const REGISTER_MAX_ATTEMPTS = 5
const GENERIC_REGISTRATION_ERROR =
  'Unable to complete registration. Please check your details or sign in if you already have an account.'

export interface RegisterWithTagInput {
  tagId: string
  tagLabel?: string
  fullName: string
  email: string
  password: string
}

export type RegisterWithTagResult =
  | { error: string }
  | { success: true; signedIn: boolean; tagId: string }

export async function registerWithTag(
  input: RegisterWithTagInput
): Promise<RegisterWithTagResult> {
  if (!input || typeof input !== 'object') {
    return { error: 'Invalid registration request.' }
  }

  if (
    typeof input.tagId !== 'string' ||
    (input.tagLabel !== undefined && typeof input.tagLabel !== 'string') ||
    typeof input.fullName !== 'string' ||
    typeof input.email !== 'string' ||
    typeof input.password !== 'string'
  ) {
    return { error: 'Invalid registration input.' }
  }

  const cleanTagId = normalizeTagId(input.tagId)
  if (!cleanTagId || isReservedTagId(cleanTagId)) {
    return { error: 'This tag is unavailable for registration.' }
  }

  if (
    typeof input.tagLabel === 'string' &&
    input.tagLabel.replace(/[\r\n\t]+/g, ' ').trim().length > TAG_LABEL_MAX_LENGTH
  ) {
    return { error: 'Tag Name must be 50 characters or fewer.' }
  }

  const resolvedTagLabel = sanitizeTagLabel(input.tagLabel) ?? 'Your Tag 1'

  const cleanFullName = input.fullName.trim()
  if (!cleanFullName || cleanFullName.length > 100) {
    return { error: 'Please enter a valid full name (up to 100 characters).' }
  }

  const cleanEmail = input.email.trim()
  if (!cleanEmail || cleanEmail.length > 254 || !EMAIL_REGEX.test(cleanEmail)) {
    return { error: 'Please enter a valid email address.' }
  }

  const password = input.password
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    }
  }

  const requestHeaders = await headers()
  const clientIp = getClientIpFromHeaders(requestHeaders)
  const { allowed } = consumeActionRateLimit([
    {
      key: `register:ip:${clientIp}`,
      windowMs: REGISTER_WINDOW_MS,
      maxRequests: REGISTER_MAX_ATTEMPTS,
    },
    {
      key: `register:tag:${cleanTagId}`,
      windowMs: REGISTER_WINDOW_MS,
      maxRequests: REGISTER_MAX_ATTEMPTS,
    },
  ])

  if (!allowed) {
    return {
      error: 'Too many registration attempts. Please wait 15 minutes and try again.',
    }
  }

  const supabase = await createClient()
  const {
    data: { user: existingSessionUser },
  } = await supabase.auth.getUser()

  if (existingSessionUser) {
    return {
      error: 'You are already signed in. Please claim this tag from your dashboard.',
    }
  }

  const serviceClient = await createServiceClient()

  // Pre-check that the tag exists, is unclaimed, and is not reserved
  const { data: tag, error: tagError } = await (serviceClient.from('tags') as any)
    .select('tag_id, owner_id')
    .eq('tag_id', cleanTagId)
    .maybeSingle()

  if (tagError) {
    console.error('[registerWithTag] tag lookup error:', tagError)
    return { error: 'Unable to verify tag right now. Please try again.' }
  }

  if (!tag || tag.owner_id !== null || isReservedTagId(tag.tag_id)) {
    return { error: GENERIC_REGISTRATION_ERROR }
  }

  const randomAvatarId = AVATAR_IDS[Math.floor(Math.random() * AVATAR_IDS.length)]

  // Instant onboarding intentionally confirms email on tag-gated signup until Custom SMTP / verified Resend domain is configured
  const { data: createData, error: createError } =
    await serviceClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanFullName,
        avatar_id: randomAvatarId,
      },
    })

  const createdUser = createData?.user
  if (createError || !createdUser) {
    console.error('[registerWithTag] createUser error:', createError?.code ?? 'unknown')
    return { error: GENERIC_REGISTRATION_ERROR }
  }

  // Atomically claim the tag only if still unclaimed
  const { data: claimedTag, error: claimError } = await (
    serviceClient.from('tags') as any
  )
    .update({
      owner_id: createdUser.id,
      label: resolvedTagLabel,
      updated_at: new Date().toISOString(),
    })
    .eq('tag_id', cleanTagId)
    .is('owner_id', null)
    .select('tag_id')
    .maybeSingle()

  if (claimError || !claimedTag) {
    if (claimError) {
      console.error('[registerWithTag] atomic claim error:', claimError)
    }

    const { error: rollbackError } = await serviceClient.auth.admin.deleteUser(
      createdUser.id
    )
    if (rollbackError) {
      console.error('[registerWithTag] user rollback error:', rollbackError)
    }

    return { error: GENERIC_REGISTRATION_ERROR }
  }

  // Establish session cookie on the server
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  })

  if (signInError) {
    console.error('[registerWithTag] server signIn error:', signInError)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/t/${cleanTagId}`)

  return {
    success: true as const,
    signedIn: !signInError,
    tagId: cleanTagId,
  }
}
