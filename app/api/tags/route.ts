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
  const { data, error } = await (serviceClient.from('tags') as any)
    .select('tag_id, active_mode')
    .eq('owner_id', user.id)

  if (error || !data) {
    return NextResponse.json(
      { error: 'Failed to load tags.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ tags: data })
}
