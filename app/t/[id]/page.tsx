import { createServiceClient } from '@/lib/supabase/server'
import { normalizeTagId } from '@/lib/tag-id'
import { SocialView } from '@/components/landing/SocialView'
import { LostFoundView } from '@/components/landing/LostFoundView'
import { EventHubView } from '@/components/landing/EventHubView'
import { NotFoundView } from '@/components/landing/NotFoundView'
import { resolveTagTheme, sanitizeBackgroundPattern, sanitizeBackgroundStyle } from '@/lib/tag-theme'
import type { TagRow, ThemeFont, ThemeColor, PageTheme } from '@/types/database'

interface TagPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function TagPage({ params }: TagPageProps) {
  const { id } = await params
  const cleanId = normalizeTagId(id)

  if (!cleanId) {
    return <NotFoundView />
  }

  // Service role key is required for public read access to tags
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('tags')
    .select('tag_id, owner_id, active_mode, metadata')
    .eq('tag_id', cleanId)
    .maybeSingle()

  const tag = data as Pick<TagRow, 'tag_id' | 'owner_id' | 'active_mode' | 'metadata'> | null

  if (error || !tag || !tag.owner_id) {
    return <NotFoundView />
  }

  let ownerAvatarId: string | null = null
  const { data: ownerProfile } = await (supabase.from('users') as any)
    .select('avatar_id')
    .eq('id', tag.owner_id)
    .maybeSingle()

  ownerAvatarId = ownerProfile?.avatar_id ?? null

  const rawMetadata = (tag.metadata as Record<string, any>) || {}
  const theme_font: ThemeFont = rawMetadata.theme_font || 'sans'
  const theme_color: ThemeColor = rawMetadata.theme_color === 'black' ? 'orange' : (rawMetadata.theme_color || 'orange')
  const page_theme: PageTheme = (rawMetadata.page_theme || rawMetadata.pageTheme) === 'dark' ? 'dark' : 'light'

  const isDark = page_theme === 'dark'
  const metadata = {
    ...rawMetadata,
    theme_font,
    theme_color,
    page_theme,
    pageTheme: page_theme,
    background_style: sanitizeBackgroundStyle(rawMetadata.background_style ?? rawMetadata.bg_preset, isDark),
    background_pattern: sanitizeBackgroundPattern(rawMetadata.background_pattern ?? rawMetadata.bg_pattern),
  }

  const resolvedTheme = resolveTagTheme(metadata)

  const renderContent = () => {
    switch (tag.active_mode) {
      case 'social':
        return (
          <SocialView
            metadata={metadata}
            avatarId={ownerAvatarId}
            expectedUserId={tag.owner_id ?? undefined}
          />
        )
      case 'lost_and_found':
        return (
          <LostFoundView
            metadata={metadata}
            avatarId={ownerAvatarId}
            expectedUserId={tag.owner_id ?? undefined}
          />
        )
      case 'event_hub':
        return <EventHubView metadata={metadata} />
      default:
        return <NotFoundView />
    }
  }

  return (
    <div
      data-micro-landing="true"
      className={`fixed inset-0 h-dvh w-full overflow-hidden overscroll-none transition-colors duration-200 ${
        isDark ? 'dark text-white' : 'text-gray-900'
      }`}
      style={{ backgroundColor: resolvedTheme.background.fallbackColor }}
    >
      {renderContent()}
    </div>
  )
}
