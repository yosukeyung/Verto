import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * DELETE /api/user/delete
 *
 * Right to Erasure endpoint.
 * 1. Authenticates the caller via the anon client (RLS-aware session).
 * 2. Deletes the user from Supabase Auth using the service-role client.
 *    ? ON DELETE CASCADE in the DB removes all rows in `tags` where owner_id = user.id.
 * 3. Returns 200 on success, 4xx/5xx on failure.
 */
export async function DELETE() {
  // 1. Verify session
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in and try again.' },
      { status: 401 }
    )
  }

  // 2. Delete via service-role client (Auth Admin API)
  const serviceClient = await createServiceClient()
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('[DELETE /api/user/delete]', deleteError)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }

  // 3. Sign out the session (best-effort; client will redirect regardless)
  await supabase.auth.signOut()

  return NextResponse.json({ success: true }, { status: 200 })
}
