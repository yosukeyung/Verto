import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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
    const { tag_id } = await request.json()

    if (!tag_id) {
      return NextResponse.json(
        { error: 'tag_id is required' },
        { status: 400 }
      )
    }

    const serviceClient = await createServiceClient()
    
    // Set owner_id = null for the specific tag owned by this user
    const { error: updateError } = await (serviceClient.from('tags') as any)
      .update({ owner_id: null })
      .eq('tag_id', tag_id)
      .eq('owner_id', user.id)

    if (updateError) {
      console.error('[POST /api/tags/unclaim]', updateError)
      return NextResponse.json(
        { error: 'Failed to unclaim tag.' },
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
