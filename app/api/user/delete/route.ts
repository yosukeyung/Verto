import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isValidTagId } from '@/lib/tag-id'

const STORAGE_PAGE_SIZE = 100
const STORAGE_MAX_PAGES = 50

/**
 * DELETE /api/user/delete
 *
 * Right to Erasure endpoint.
 * 1. Authenticates the caller via the anon client (RLS-aware session).
 * 2. Explicitly detaches owned tags and wipes their mode/metadata via service-role client.
 * 3. Deletes the user from Supabase Auth using the service-role client
 *    (ON DELETE CASCADE removes public.users; ON DELETE SET NULL is backed by explicit wipe + trigger).
 * 4. Removes user storage objects after account deletion succeeds.
 * 5. Revalidates affected paths, signs out best-effort, and returns 200.
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

  const serviceClient = await createServiceClient()

  // 2. Explicitly clear PII/metadata and detach all tags owned by this user before deletion
  const { data: clearedTags, error: clearTagsError } = await (serviceClient.from('tags') as any)
    .update({
      owner_id: null,
      label: null,
      active_mode: 'social',
      metadata: {},
      updated_at: new Date().toISOString(),
    })
    .eq('owner_id', user.id)
    .select('tag_id')

  if (clearTagsError) {
    console.error('[DELETE /api/user/delete] clear tags error:', clearTagsError)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }

  // 3. Delete user from Supabase Auth
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('[DELETE /api/user/delete]', deleteError)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }

  // 4. Clean up user's storage folder (avatar + item photos) only after user deletion succeeds
  let removedAny = false
  for (let page = 0; page < STORAGE_MAX_PAGES; page++) {
    const { data: userFiles, error: listError } = await serviceClient.storage
      .from('avatars')
      .list(user.id, { limit: STORAGE_PAGE_SIZE, offset: 0 })

    if (listError) {
      console.error('[DELETE /api/user/delete] storage list error:', listError)
      break
    }

    if (!userFiles || userFiles.length === 0) {
      if (page === 0 && !removedAny) {
        await serviceClient.storage.from('avatars').remove([`${user.id}/avatar.webp`])
      }
      break
    }

    const pathsToRemove = userFiles
      .map((f) => f.name)
      .filter((name): name is string => typeof name === 'string' && name.length > 0)
      .map((name) => `${user.id}/${name}`)

    if (pathsToRemove.length === 0) {
      break
    }

    const { error: removeError } = await serviceClient.storage
      .from('avatars')
      .remove(pathsToRemove)

    if (removeError) {
      console.error('[DELETE /api/user/delete] storage remove error:', removeError)
      break
    }

    removedAny = true

    if (userFiles.length < STORAGE_PAGE_SIZE) {
      break
    }
  }

  revalidatePath('/dashboard')
  if (Array.isArray(clearedTags)) {
    for (const row of clearedTags) {
      if (isValidTagId(row?.tag_id)) {
        revalidatePath(`/t/${row.tag_id}`)
      }
    }
  }

  // 5. Sign out the session (best-effort; client will redirect regardless)
  await supabase.auth.signOut()

  return NextResponse.json({ success: true }, { status: 200 })
}
