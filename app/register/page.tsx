import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { isReservedTagId, normalizeTagId } from '@/lib/tag-id'
import RegisterClient from './RegisterForm'

export const dynamic = 'force-dynamic'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ tag_id?: string | string[] }>
}) {
  const params = await searchParams
  const cleanTagId = normalizeTagId(params?.tag_id)

  if (!cleanTagId || isReservedTagId(cleanTagId)) {
    notFound()
  }

  const supabase = await createServiceClient()
  const { data: tag, error } = await (supabase.from('tags') as any)
    .select('tag_id, owner_id')
    .eq('tag_id', cleanTagId)
    .maybeSingle()

  if (error || !tag || tag.owner_id !== null || isReservedTagId(tag.tag_id)) {
    notFound()
  }

  return <RegisterClient initialTagId={tag.tag_id} />
}
