import React from 'react'
import type { ResolvedTagBackground } from '@/lib/tag-theme'

interface TagBackgroundProps {
  background: ResolvedTagBackground
}

/** Full-bleed solid/gradient surface with repeating CSS-masked SVG pattern and center readability scrim. */
export function TagBackground({ background }: TagBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Layer 1: Base solid or subtle close-tone gradient */}
      <div
        className="absolute inset-0 transition-colors duration-200"
        style={{
          backgroundColor: background.fallbackColor,
          backgroundImage: background.backgroundImage,
        }}
      />

      {/* Layer 2: Repeating SVG mask pattern */}
      {background.patternSrc && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: background.patternColor,
            opacity: background.patternOpacity,
            maskImage: `url('${background.patternSrc}')`,
            WebkitMaskImage: `url('${background.patternSrc}')`,
            maskRepeat: 'repeat',
            WebkitMaskRepeat: 'repeat',
            maskSize: background.patternTileSize,
            WebkitMaskSize: background.patternTileSize,
            maskPosition: 'center top',
            WebkitMaskPosition: 'center top',
          }}
        />
      )}

      {/* Layer 3: Subtle center readability scrim behind primary copy and actions */}
      {background.patternSrc && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse 68% 62% at 50% 48%, ${background.scrimColor} 0%, transparent 100%)`,
          }}
        />
      )}
    </div>
  )
}
