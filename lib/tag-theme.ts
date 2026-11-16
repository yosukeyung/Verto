import type { ThemeColor, ThemeFont } from '@/types/database'

export const FONT_MAP: Record<ThemeFont, string> = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
}

export interface TagAccentTheme {
  hex: string
  bannerGradientLight: string
  bannerGradientDark: string
}

export const TAG_ACCENT_MAP: Record<Exclude<ThemeColor, 'black'>, TagAccentTheme> = {
  orange: {
    hex: '#FF5C00',
    bannerGradientLight: 'bg-gradient-to-b from-[#FF5C00]/25 via-[#FF5C00]/10 to-transparent',
    bannerGradientDark: 'bg-gradient-to-b from-[#FF5C00]/35 via-[#FF5C00]/14 to-transparent',
  },
  emerald: {
    hex: '#10B981',
    bannerGradientLight: 'bg-gradient-to-b from-[#10B981]/25 via-[#10B981]/10 to-transparent',
    bannerGradientDark: 'bg-gradient-to-b from-[#10B981]/30 via-[#10B981]/12 to-transparent',
  },
  blue: {
    hex: '#3B82F6',
    bannerGradientLight: 'bg-gradient-to-b from-[#3B82F6]/25 via-[#3B82F6]/10 to-transparent',
    bannerGradientDark: 'bg-gradient-to-b from-[#3B82F6]/35 via-[#3B82F6]/14 to-transparent',
  },
}

export function resolveTagTheme(metadata: Record<string, any>) {
  const fontKey: ThemeFont = (metadata.theme_font as ThemeFont) || 'sans'
  const rawColor = metadata.theme_color as ThemeColor | undefined
  const colorKey: Exclude<ThemeColor, 'black'> =
    !rawColor || rawColor === 'black' || !(rawColor in TAG_ACCENT_MAP)
      ? 'orange'
      : (rawColor as Exclude<ThemeColor, 'black'>)
  const isDark = (metadata.page_theme || metadata.pageTheme) === 'dark'

  return {
    fontClass: FONT_MAP[fontKey] || FONT_MAP.sans,
    accent: TAG_ACCENT_MAP[colorKey],
    isDark,
  }
}
