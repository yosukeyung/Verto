import { createServiceClient } from '@/lib/supabase/server'
import { SocialView } from '@/components/landing/SocialView'
import { LostFoundView } from '@/components/landing/LostFoundView'
import { EventHubView } from '@/components/landing/EventHubView'
import { NotFoundView } from '@/components/landing/NotFoundView'
import type { TagRow } from '@/types/database'

interface TagPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function TagPage({ params }: TagPageProps) {
  const { id } = await params
  const cleanId = id?.trim()

  if (!cleanId) {
    return <NotFoundView />
  }

  // Service role key is required for public read access to tags
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('tag_id', cleanId)
    .single()

  const tag = data as TagRow | null

  if (error || !tag) {
    return <NotFoundView />
  }

  const metadata = (tag.metadata as Record<string, any>) || {}

  switch (tag.active_mode) {
    case 'social':
      return <SocialView metadata={metadata} />
    case 'lost_and_found':
      return <LostFoundView metadata={metadata} />
    case 'event_hub':
      return <EventHubView metadata={metadata} />
    default:
      return <NotFoundView />
  }
}
