import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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
    const { full_name, avatar_id } = await request.json()

    if (!full_name || !avatar_id) {
      return NextResponse.json(
        { error: 'full_name and avatar_id are required' },
        { status: 400 }
      )
    }

    const serviceClient = await createServiceClient()
    const { error: updateError } = await (serviceClient.from('users') as any)
      .update({ full_name, avatar_id })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update profile.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 }
    )
  }
}
