import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardManager } from '@/components/dashboard/DashboardManager'
import type { TagRow } from '@/types/database'

interface DashboardPageProps {
  searchParams: Promise<{ tag?: string }>
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { data: tags, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .eq('owner_id', user.id)
    .order('tag_id', { ascending: true })

  if (tagsError) {
    console.error('Error fetching tags:', tagsError)
  }

  return (
    <DashboardManager
      initialTags={(tags as TagRow[]) || []}
      userEmail={user.email || ''}
      initialSelectedTagId={resolvedSearchParams?.tag}
    />
  )
}
