import { createServiceClient } from '@/lib/supabase/server'
import { SocialView } from '@/components/landing/SocialView'
import { LostFoundView } from '@/components/landing/LostFoundView'
import { EventHubView } from '@/components/landing/EventHubView'
import { NotFoundView } from '@/components/landing/NotFoundView'
import type { TagRow, ThemeFont, ThemeColor, PageTheme } from '@/types/database'

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

  const rawMetadata = (tag.metadata as Record<string, any>) || {}
  const theme_font: ThemeFont = rawMetadata.theme_font || 'sans'
  const theme_color: ThemeColor = rawMetadata.theme_color || 'orange'
  const page_theme: PageTheme = (rawMetadata.page_theme || rawMetadata.pageTheme) === 'dark' ? 'dark' : 'light'

  const metadata = {
    ...rawMetadata,
    theme_font,
    theme_color,
    page_theme,
    pageTheme: page_theme,
  }

  const isDark = page_theme === 'dark'

  const renderContent = () => {
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

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDark ? 'dark bg-neutral-900 text-white' : 'bg-white text-gray-900'
      }`}
    >
      {renderContent()}
    </div>
  )
}
