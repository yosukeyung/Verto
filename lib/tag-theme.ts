import type {
  BackgroundPattern,
  BackgroundStyle,
  DarkBackgroundStyle,
  LightBackgroundStyle,
  ThemeColor,
  ThemeFont,
} from '@/types/database'

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

export type AccentKey = Exclude<ThemeColor, 'black'>

export const TAG_ACCENT_MAP: Record<AccentKey, TagAccentTheme> = {
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

export interface BackgroundStyleOption<T extends BackgroundStyle = BackgroundStyle> {
  id: T
  label: string
  fallbackColor: string
  backgroundImage: string
  swatchFallback: string
  swatchBackground: string
  patternColor: string
  scrimColor: string
  buttonBg: string
  buttonHoverBg: string
  buttonBorder: string
  cardBg: string
  cardBorder: string
}

export const LIGHT_BACKGROUND_STYLES: readonly BackgroundStyleOption<LightBackgroundStyle>[] = [
  {
    id: 'pure_white',
    label: 'Pure White',
    fallbackColor: '#FFFFFF',
    backgroundImage: 'none',
    swatchFallback: '#FFFFFF',
    swatchBackground: 'none',
    patternColor: '#171717',
    scrimColor: 'rgba(255, 255, 255, 0.45)',
    buttonBg: 'rgba(255, 255, 255, 0.92)',
    buttonHoverBg: 'rgba(249, 250, 251, 0.98)',
    buttonBorder: 'rgba(209, 213, 219, 0.95)',
    cardBg: 'rgba(249, 250, 251, 0.88)',
    cardBorder: 'rgba(229, 231, 235, 0.95)',
  },
  {
    id: 'warm_ivory_mist',
    label: 'Warm Ivory Mist',
    fallbackColor: '#FAF3E6',
    backgroundImage: 'linear-gradient(160deg, #FFFDF9 0%, #FAF3E6 54%, #F2E6D2 100%)',
    swatchFallback: '#F5E7CF',
    swatchBackground: 'linear-gradient(145deg, #FFFDF7 0%, #F5E6CD 55%, #E7D0AD 100%)',
    patternColor: '#785634',
    scrimColor: 'rgba(252, 246, 236, 0.46)',
    buttonBg: 'rgba(255, 251, 245, 0.88)',
    buttonHoverBg: 'rgba(255, 253, 249, 0.96)',
    buttonBorder: 'rgba(218, 198, 170, 0.9)',
    cardBg: 'rgba(255, 251, 245, 0.84)',
    cardBorder: 'rgba(218, 198, 170, 0.85)',
  },
  {
    id: 'cool_frost_breeze',
    label: 'Cool Frost Breeze',
    fallbackColor: '#EFF6FB',
    backgroundImage: 'linear-gradient(160deg, #FBFDFF 0%, #EFF6FB 54%, #E2EFF8 100%)',
    swatchFallback: '#DDECF7',
    swatchBackground: 'linear-gradient(145deg, #F7FBFF 0%, #DCEEFB 55%, #BDDDF4 100%)',
    patternColor: '#33536B',
    scrimColor: 'rgba(242, 248, 253, 0.46)',
    buttonBg: 'rgba(248, 252, 255, 0.88)',
    buttonHoverBg: 'rgba(253, 254, 255, 0.96)',
    buttonBorder: 'rgba(186, 213, 235, 0.92)',
    cardBg: 'rgba(248, 252, 255, 0.84)',
    cardBorder: 'rgba(186, 213, 235, 0.86)',
  },
  {
    id: 'soft_blush_linen',
    label: 'Soft Blush Linen',
    fallbackColor: '#FBF1F3',
    backgroundImage: 'linear-gradient(160deg, #FFFDFE 0%, #FBF1F3 54%, #F4E3E7 100%)',
    swatchFallback: '#F4DCE2',
    swatchBackground: 'linear-gradient(145deg, #FFFBFD 0%, #F7DFE5 55%, #EAC2CD 100%)',
    patternColor: '#7A4252',
    scrimColor: 'rgba(252, 244, 246, 0.46)',
    buttonBg: 'rgba(255, 249, 250, 0.88)',
    buttonHoverBg: 'rgba(255, 252, 253, 0.96)',
    buttonBorder: 'rgba(228, 198, 206, 0.92)',
    cardBg: 'rgba(255, 249, 250, 0.84)',
    cardBorder: 'rgba(228, 198, 206, 0.86)',
  },
]

export const DARK_BACKGROUND_STYLES: readonly BackgroundStyleOption<DarkBackgroundStyle>[] = [
  {
    id: 'pitch_charcoal',
    label: 'Pitch Charcoal',
    fallbackColor: '#141416',
    backgroundImage: 'none',
    swatchFallback: '#16161A',
    swatchBackground: 'none',
    patternColor: '#FFFFFF',
    scrimColor: 'rgba(20, 20, 22, 0.42)',
    buttonBg: 'rgba(34, 34, 38, 0.88)',
    buttonHoverBg: 'rgba(46, 46, 52, 0.94)',
    buttonBorder: 'rgba(72, 72, 82, 0.82)',
    cardBg: 'rgba(28, 28, 32, 0.86)',
    cardBorder: 'rgba(64, 64, 74, 0.85)',
  },
  {
    id: 'midnight_indigo',
    label: 'Midnight Indigo',
    fallbackColor: '#161B2E',
    backgroundImage: 'linear-gradient(160deg, #0F111A 0%, #161B2E 55%, #1E2540 100%)',
    swatchFallback: '#1E2747',
    swatchBackground: 'linear-gradient(145deg, #13182A 0%, #24305A 55%, #374782 100%)',
    patternColor: '#C7D2FE',
    scrimColor: 'rgba(22, 27, 46, 0.42)',
    buttonBg: 'rgba(32, 39, 66, 0.86)',
    buttonHoverBg: 'rgba(42, 51, 84, 0.94)',
    buttonBorder: 'rgba(84, 98, 148, 0.72)',
    cardBg: 'rgba(26, 32, 56, 0.84)',
    cardBorder: 'rgba(74, 88, 134, 0.75)',
  },
  {
    id: 'deep_pine_shadow',
    label: 'Deep Pine Shadow',
    fallbackColor: '#14221D',
    backgroundImage: 'linear-gradient(160deg, #0F1513 0%, #14221D 55%, #1A2F27 100%)',
    swatchFallback: '#1A342B',
    swatchBackground: 'linear-gradient(145deg, #101E19 0%, #1E3E33 55%, #2D5C4C 100%)',
    patternColor: '#A7F3D0',
    scrimColor: 'rgba(20, 34, 29, 0.42)',
    buttonBg: 'rgba(27, 48, 40, 0.86)',
    buttonHoverBg: 'rgba(35, 61, 51, 0.94)',
    buttonBorder: 'rgba(70, 114, 96, 0.72)',
    cardBg: 'rgba(22, 40, 33, 0.84)',
    cardBorder: 'rgba(62, 102, 86, 0.75)',
  },
  {
    id: 'warm_espresso',
    label: 'Warm Espresso',
    fallbackColor: '#221915',
    backgroundImage: 'linear-gradient(160deg, #151110 0%, #221915 55%, #2F221B 100%)',
    swatchFallback: '#36251D',
    swatchBackground: 'linear-gradient(145deg, #1C1411 0%, #3E2A20 55%, #5C3F30 100%)',
    patternColor: '#F3D8BE',
    scrimColor: 'rgba(34, 25, 21, 0.42)',
    buttonBg: 'rgba(50, 37, 30, 0.86)',
    buttonHoverBg: 'rgba(64, 48, 39, 0.94)',
    buttonBorder: 'rgba(116, 89, 73, 0.72)',
    cardBg: 'rgba(42, 31, 25, 0.84)',
    cardBorder: 'rgba(104, 79, 65, 0.75)',
  },
]

const ALL_STYLE_MAP: Record<BackgroundStyle, BackgroundStyleOption> = [
  ...LIGHT_BACKGROUND_STYLES,
  ...DARK_BACKGROUND_STYLES,
].reduce((acc, item) => {
  acc[item.id] = item
  return acc
}, {} as Record<BackgroundStyle, BackgroundStyleOption>)

const LIGHT_STYLE_IDS = new Set<string>(LIGHT_BACKGROUND_STYLES.map((s) => s.id))
const DARK_STYLE_IDS = new Set<string>(DARK_BACKGROUND_STYLES.map((s) => s.id))

const LIGHT_TO_DARK_PAIR: Record<LightBackgroundStyle, DarkBackgroundStyle> = {
  pure_white: 'pitch_charcoal',
  warm_ivory_mist: 'warm_espresso',
  cool_frost_breeze: 'midnight_indigo',
  soft_blush_linen: 'deep_pine_shadow',
}

const DARK_TO_LIGHT_PAIR: Record<DarkBackgroundStyle, LightBackgroundStyle> = {
  pitch_charcoal: 'pure_white',
  warm_espresso: 'warm_ivory_mist',
  midnight_indigo: 'cool_frost_breeze',
  deep_pine_shadow: 'soft_blush_linen',
}

const LEGACY_PRESET_MAP: Record<string, { light: LightBackgroundStyle; dark: DarkBackgroundStyle }> = {
  pure: { light: 'pure_white', dark: 'pitch_charcoal' },
  warm_panda: { light: 'warm_ivory_mist', dark: 'warm_espresso' },
  calm_mist: { light: 'cool_frost_breeze', dark: 'midnight_indigo' },
  accent_wash: { light: 'soft_blush_linen', dark: 'deep_pine_shadow' },
}

function hasOwn<T extends object>(obj: T, key: string): key is Extract<keyof T, string> {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function getBackgroundStyleOptions(isDark: boolean): readonly BackgroundStyleOption[] {
  return isDark ? DARK_BACKGROUND_STYLES : LIGHT_BACKGROUND_STYLES
}

/** Maps a background style (or legacy preset) to the matching Light/Dark palette entry. */
export function mapBackgroundStyleForTheme(raw: unknown, targetIsDark: boolean): BackgroundStyle {
  if (typeof raw === 'string') {
    if (targetIsDark) {
      if (DARK_STYLE_IDS.has(raw)) return raw as DarkBackgroundStyle
      if (LIGHT_STYLE_IDS.has(raw)) return LIGHT_TO_DARK_PAIR[raw as LightBackgroundStyle]
      if (hasOwn(LEGACY_PRESET_MAP, raw)) return LEGACY_PRESET_MAP[raw].dark
    } else {
      if (LIGHT_STYLE_IDS.has(raw)) return raw as LightBackgroundStyle
      if (DARK_STYLE_IDS.has(raw)) return DARK_TO_LIGHT_PAIR[raw as DarkBackgroundStyle]
      if (hasOwn(LEGACY_PRESET_MAP, raw)) return LEGACY_PRESET_MAP[raw].light
    }
  }
  return targetIsDark ? 'pitch_charcoal' : 'pure_white'
}

export function sanitizeBackgroundStyle(raw: unknown, isDark: boolean): BackgroundStyle {
  return mapBackgroundStyleForTheme(raw, isDark)
}

export const VALID_BACKGROUND_PATTERNS: readonly BackgroundPattern[] = [
  'none',
  'circuit_board',
  'topography',
  'stripes',
  'i_like_food',
]

export function sanitizeBackgroundPattern(raw: unknown): BackgroundPattern {
  return typeof raw === 'string' && (VALID_BACKGROUND_PATTERNS as readonly string[]).includes(raw)
    ? (raw as BackgroundPattern)
    : 'none'
}

export interface BgPatternOption {
  id: BackgroundPattern
  label: string
  src: string | null
  tileSize: string
  swatchTileSize: string
  opacityLight: number
  opacityDark: number
}

export const BG_PATTERN_OPTIONS: BgPatternOption[] = [
  {
    id: 'none',
    label: 'None',
    src: null,
    tileSize: '',
    swatchTileSize: '',
    opacityLight: 0,
    opacityDark: 0,
  },
  {
    id: 'circuit_board',
    label: 'Circuit',
    src: '/bg/circuit-board.svg',
    tileSize: '304px 304px',
    swatchTileSize: '96px 96px',
    opacityLight: 0.055,
    opacityDark: 0.07,
  },
  {
    id: 'topography',
    label: 'Topography',
    src: '/bg/topography.svg',
    tileSize: '600px 600px',
    swatchTileSize: '160px 160px',
    opacityLight: 0.06,
    opacityDark: 0.075,
  },
  {
    id: 'stripes',
    label: 'Stripes',
    src: '/bg/stripes.svg',
    tileSize: '40px 1px',
    swatchTileSize: '40px 1px',
    opacityLight: 0.04,
    opacityDark: 0.045,
  },
  {
    id: 'i_like_food',
    label: 'Foodie',
    src: '/bg/i-like-food.svg',
    tileSize: '260px 260px',
    swatchTileSize: '88px 88px',
    opacityLight: 0.055,
    opacityDark: 0.07,
  },
]

const BG_PATTERN_MAP: Record<BackgroundPattern, BgPatternOption> = BG_PATTERN_OPTIONS.reduce(
  (acc, item) => {
    acc[item.id] = item
    return acc
  },
  {} as Record<BackgroundPattern, BgPatternOption>
)

export interface ResolvedTagBackground {
  fallbackColor: string
  backgroundImage: string
  swatchFallback: string
  swatchBackground: string
  patternSrc: string | null
  patternColor: string
  patternOpacity: number
  patternTileSize: string
  scrimColor: string
  buttonBg: string
  buttonHoverBg: string
  buttonBorder: string
  cardBg: string
  cardBorder: string
}

/** Resolves base surface tokens, pattern overlay, and adaptive button/card styles for a tag. */
export function resolveTagBackground(
  styleId: BackgroundStyle,
  patternId: BackgroundPattern,
  isDark: boolean
): ResolvedTagBackground {
  const safeStyleId = sanitizeBackgroundStyle(styleId, isDark)
  const surface = hasOwn(ALL_STYLE_MAP, safeStyleId)
    ? ALL_STYLE_MAP[safeStyleId]
    : ALL_STYLE_MAP.pure_white
  const patternConfig =
    typeof patternId === 'string' && hasOwn(BG_PATTERN_MAP, patternId)
      ? BG_PATTERN_MAP[patternId]
      : BG_PATTERN_MAP.none

  return {
    fallbackColor: surface.fallbackColor,
    backgroundImage: surface.backgroundImage,
    swatchFallback: surface.swatchFallback,
    swatchBackground: surface.swatchBackground,
    patternSrc: patternConfig.src,
    patternColor: surface.patternColor,
    patternOpacity: isDark ? patternConfig.opacityDark : patternConfig.opacityLight,
    patternTileSize: patternConfig.tileSize,
    scrimColor: surface.scrimColor,
    buttonBg: surface.buttonBg,
    buttonHoverBg: surface.buttonHoverBg,
    buttonBorder: surface.buttonBorder,
    cardBg: surface.cardBg,
    cardBorder: surface.cardBorder,
  }
}

export function resolveTagTheme(metadata: Record<string, any>) {
  const rawFont = metadata.theme_font
  const fontKey: ThemeFont =
    typeof rawFont === 'string' && hasOwn(FONT_MAP, rawFont) ? (rawFont as ThemeFont) : 'sans'
  const rawColor = metadata.theme_color
  const colorKey: AccentKey =
    typeof rawColor !== 'string' || rawColor === 'black' || !hasOwn(TAG_ACCENT_MAP, rawColor)
      ? 'orange'
      : (rawColor as AccentKey)
  const isDark = (metadata.page_theme || metadata.pageTheme) === 'dark'
  const backgroundStyle = sanitizeBackgroundStyle(
    metadata.background_style ?? metadata.bg_preset,
    isDark
  )
  const backgroundPattern = sanitizeBackgroundPattern(
    metadata.background_pattern ?? metadata.bg_pattern
  )

  return {
    fontClass: FONT_MAP[fontKey],
    accent: TAG_ACCENT_MAP[colorKey],
    colorKey,
    isDark,
    backgroundStyle,
    backgroundPattern,
    background: resolveTagBackground(backgroundStyle, backgroundPattern, isDark),
  }
}
