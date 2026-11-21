import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { ThemeSwitch } from '@/components/ui/ThemeSwitch'
import { isReservedTagId, normalizeTagId } from '@/lib/tag-id'
import { getNextDefaultTagName } from '@/lib/tag-label'
import { ClaimForm } from './ClaimForm'

export const dynamic = 'force-dynamic'

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ tag_id?: string | string[] }>
}) {
  const params = await searchParams
  const normalizedTagId = normalizeTagId(params?.tag_id)
  const tagId = normalizedTagId && !isReservedTagId(normalizedTagId) ? normalizedTagId : ''

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect(tagId ? `/login?tag_id=${encodeURIComponent(tagId)}` : '/login')
  }

  let defaultTagName = 'Your Tag 1'
  if (tagId) {
    const { data: ownedTags } = await supabase
      .from('tags')
      .select('tag_id, label')
      .eq('owner_id', user.id)
      .order('tag_id', { ascending: true })

    defaultTagName = getNextDefaultTagName(
      (ownedTags ?? []).map((t: { label?: string | null }) => t.label)
    )
  }

  return (
    <div className="min-h-dvh bg-white dark:bg-black flex flex-col">
      <Navbar rightAction={<ThemeSwitch />} />
      <main className="flex-1 flex flex-col justify-center px-4 py-8">
        <ClaimForm tagId={tagId} defaultTagName={defaultTagName} />
      </main>
    </div>
  )
}
