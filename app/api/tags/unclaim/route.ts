import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isValidTagId } from '@/lib/tag-id'

export async function POST(request: Request) {
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
