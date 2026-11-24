import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { isTrustedRequestOrigin } from '@/lib/request-origin'
import { isValidTagId } from '@/lib/tag-id'

const STORAGE_PAGE_SIZE = 100
const STORAGE_MAX_PAGES_PER_FOLDER = 50
const STORAGE_MAX_FOLDERS = 100
const STORAGE_MAX_DEPTH = 5

async function cleanupUserStorageFolder(
  serviceClient: Awaited<ReturnType<typeof createServiceClient>>,
  userId: string
): Promise<void> {
  const queue: Array<{ prefix: string; depth: number }> = [{ prefix: userId, depth: 0 }]
  const visitedPrefixes = new Set<string>()
  const filePathsToRemove: string[] = []
  let foldersProcessed = 0

  while (queue.length > 0 && foldersProcessed < STORAGE_MAX_FOLDERS) {
    const current = queue.shift()
    if (!current || visitedPrefixes.has(current.prefix)) {
      continue
    }
    visitedPrefixes.add(current.prefix)
    foldersProcessed += 1

    for (let page = 0; page < STORAGE_MAX_PAGES_PER_FOLDER; page++) {
      const { data: entries, error: listError } = await serviceClient.storage
        .from('avatars')
        .list(current.prefix, {
          limit: STORAGE_PAGE_SIZE,
          offset: page * STORAGE_PAGE_SIZE,
        })

      if (listError) {
        console.error('[DELETE /api/user/delete] storage list error:', listError)
        break
      }

      if (!entries || entries.length === 0) {
        break
      }

      for (const entry of entries) {
        if (typeof entry?.name !== 'string' || !entry.name || entry.name.includes('..')) {
          continue
        }

        const entryPath = `${current.prefix}/${entry.name}`
        // Supabase Storage returns folder placeholders with id === null
        if (entry.id === null) {
          if (current.depth < STORAGE_MAX_DEPTH) {
            queue.push({ prefix: entryPath, depth: current.depth + 1 })
          }
        } else {
          filePathsToRemove.push(entryPath)
        }
      }

      if (entries.length < STORAGE_PAGE_SIZE) {
        break
      }
    }
  }

  if (filePathsToRemove.length === 0) {
    await serviceClient.storage.from('avatars').remove([`${userId}/avatar.webp`])
    return
  }

  for (let i = 0; i < filePathsToRemove.length; i += STORAGE_PAGE_SIZE) {
    const batch = filePathsToRemove.slice(i, i + STORAGE_PAGE_SIZE)
    const { error: removeError } = await serviceClient.storage
      .from('avatars')
      .remove(batch)

    if (removeError) {
      console.error('[DELETE /api/user/delete] storage remove error:', removeError)
    }
  }
}

/**
 * DELETE /api/user/delete
 *
 * Right to Erasure endpoint.
 * 1. Validates same-origin and authenticates caller via anon client.
 * 2. Snapshots owned tag IDs read-only before deletion (no premature mutation on failure).
 * 3. Deletes user from Supabase Auth first so FK ON DELETE SET NULL + DB trigger detach/wipe atomically.
 * 4. Runs defense-in-depth cleanup on unowned snapshotted tags and recursive user storage cleanup.
 * 5. Revalidates affected paths, signs out best-effort, and returns 200.
 */
export async function DELETE(request: Request) {
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
      { error: 'Unauthorized. Please sign in and try again.' },
      { status: 401 }
    )
  }

  const serviceClient = await createServiceClient()

  // Snapshot owned tag IDs read-only so transient Auth deletion failure leaves user tags intact
  const { data: ownedTags, error: fetchTagsError } = await (serviceClient.from('tags') as any)
    .select('tag_id')
    .eq('owner_id', user.id)

  if (fetchTagsError) {
    console.error('[DELETE /api/user/delete] fetch tags error:', fetchTagsError)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }

  const ownedTagIds: string[] = Array.isArray(ownedTags)
    ? ownedTags
        .map((row: { tag_id?: unknown }) => row?.tag_id)
        .filter((id): id is string => isValidTagId(id))
    : []

  // Delete user from Supabase Auth first: ON DELETE CASCADE removes public.users,
  // ON DELETE SET NULL + trigger_cleanup_unclaimed_tags wipes detached tags atomically
  const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

  if (deleteError) {
    console.error('[DELETE /api/user/delete]', deleteError)
    return NextResponse.json(
      { error: 'Failed to delete account. Please contact support.' },
      { status: 500 }
    )
  }

  // Defense-in-depth: wipe snapshotted tags strictly where owner_id IS NULL
  if (ownedTagIds.length > 0) {
    const { error: wipeError } = await (serviceClient.from('tags') as any)
      .update({
        owner_id: null,
        label: null,
        active_mode: 'social',
        metadata: {},
        updated_at: new Date().toISOString(),
      })
      .in('tag_id', ownedTagIds)
      .is('owner_id', null)

    if (wipeError) {
      console.error('[DELETE /api/user/delete] post-delete tag wipe error:', wipeError)
    }
  }

  await cleanupUserStorageFolder(serviceClient, user.id)

  revalidatePath('/dashboard')
  for (const tagId of ownedTagIds) {
    revalidatePath(`/t/${tagId}`)
  }

  await supabase.auth.signOut()

  return NextResponse.json({ success: true }, { status: 200 })
}
