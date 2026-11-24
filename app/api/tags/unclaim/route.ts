import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getClientIpFromHeaders } from '@/lib/client-ip'
import { consumeActionRateLimit } from '@/lib/action-rate-limit'
import { isTrustedRequestOrigin } from '@/lib/request-origin'
import { isValidTagId } from '@/lib/tag-id'

const UNCLAIM_USER_WINDOW_MS = 60 * 60 * 1000
const UNCLAIM_USER_MAX = 3
const UNCLAIM_IP_WINDOW_MS = 60 * 60 * 1000
const UNCLAIM_IP_MAX = 5
const UNCLAIM_TAG_COOLDOWN_MS = 15 * 60 * 1000

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request)) {
    return NextResponse.json(
      { error: 'Forbidden request origin.' },
      { status: 403 }
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in.' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const tag_id = body?.tag_id

    if (!isValidTagId(tag_id)) {
      return NextResponse.json(
        { error: 'Invalid tag_id.' },
        { status: 400 }
      )
    }

    const clientIp = getClientIpFromHeaders(request.headers)
    const { allowed, retryAfterSec } = consumeActionRateLimit([
      {
        key: `unclaim:user:${user.id}`,
        windowMs: UNCLAIM_USER_WINDOW_MS,
        maxRequests: UNCLAIM_USER_MAX,
      },
      {
        key: `unclaim:ip:${clientIp}`,
        windowMs: UNCLAIM_IP_WINDOW_MS,
        maxRequests: UNCLAIM_IP_MAX,
      },
      {
        key: `unclaim:tag:${tag_id}`,
        windowMs: UNCLAIM_TAG_COOLDOWN_MS,
        maxRequests: 1,
      },
    ])

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many unclaim requests. Please wait before trying again.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSec) },
        }
      )
    }

    const serviceClient = await createServiceClient()

    // Detach tag and wipe PII/metadata atomically only if owned by caller
    const { data: unclaimedTag, error: updateError } = await (serviceClient.from('tags') as any)
      .update({
        owner_id: null,
        label: null,
        active_mode: 'social',
        metadata: {},
        updated_at: new Date().toISOString(),
      })
      .eq('tag_id', tag_id)
      .eq('owner_id', user.id)
      .select('tag_id')
      .maybeSingle()

    if (updateError) {
      console.error('[POST /api/tags/unclaim]', updateError)
      return NextResponse.json(
        { error: 'Failed to unclaim tag.' },
        { status: 500 }
      )
    }

    if (!unclaimedTag) {
      return NextResponse.json(
        { error: 'Tag not found.' },
        { status: 404 }
      )
    }

    const { error: storageError } = await serviceClient.storage
      .from('avatars')
      .remove([`${user.id}/item_${tag_id}.webp`])

    if (storageError) {
      console.error('[POST /api/tags/unclaim] storage remove error:', storageError)
    }

    revalidatePath('/dashboard')
    revalidatePath(`/t/${tag_id}`)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}
