import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { DashboardManager } from '@/components/dashboard/DashboardManager'
import type { TagRow } from '@/types/database'
import type { UserProfile } from '@/components/providers/UserContext'

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

  // Pre-fetch user profile server-side to eliminate stale avatar flicker
  const serviceClient = await createServiceClient()
  const { data: userProfile, error: profileError } = await (serviceClient.from('users') as any)
    .select('full_name, avatar_id, email')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Error fetching profile server-side:', profileError)
  }

  const initialProfile: UserProfile = {
    email: user.email || userProfile?.email || '',
    full_name: userProfile?.full_name || '',
    avatar_id: userProfile?.avatar_id || 'love',
  }

  const hasCompletedOnboarding = Boolean(
    user.user_metadata?.has_completed_onboarding || user.user_metadata?.hasSeenTutorial
  )

  return (
    <DashboardManager
      initialTags={(tags as TagRow[]) || []}
      userEmail={user.email || ''}
      userId={user.id}
      hasCompletedOnboarding={hasCompletedOnboarding}
      initialSelectedTagId={resolvedSearchParams?.tag}
      initialProfile={initialProfile}
    />
  )
}

