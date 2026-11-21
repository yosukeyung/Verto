import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isStaticAvatarId, sanitizeProfileAvatarId } from '@/lib/url-validation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
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

  const serviceClient = await createServiceClient()
  const { data, error } = await (serviceClient.from('users') as any)
    .select('full_name, avatar_id, email')
    .eq('id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to load profile.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    email: data.email,
    full_name: data.full_name,
    avatar_id: data.avatar_id,
  })
}

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
    const rawFullName = body?.full_name
    const rawAvatarId = body?.avatar_id

    if (typeof rawFullName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid full_name.' },
        { status: 400 }
      )
    }

    const trimmedName = rawFullName.trim()
    if (!trimmedName || trimmedName.length > 100) {
      return NextResponse.json(
        { error: 'full_name must be between 1 and 100 characters.' },
        { status: 400 }
      )
    }

    const validAvatarId = sanitizeProfileAvatarId(rawAvatarId, {
      expectedUserId: user.id,
    })

    if (!validAvatarId) {
      return NextResponse.json(
        { error: 'Invalid avatar_id.' },
        { status: 400 }
      )
    }

    const serviceClient = await createServiceClient()
    const { error: updateError } = await (serviceClient.from('users') as any)
      .update({ full_name: trimmedName, avatar_id: validAvatarId })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update profile.' },
        { status: 500 }
      )
    }

    // Zero-orphan storage cleanup when switching back to a static Red Panda avatar
    if (isStaticAvatarId(validAvatarId)) {
      await serviceClient.storage.from('avatars').remove([`${user.id}/avatar.webp`])
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}
