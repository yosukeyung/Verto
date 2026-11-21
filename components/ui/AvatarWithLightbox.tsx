'use client'

import React, { useState } from 'react'
import { AvatarLightbox } from '@/components/ui/AvatarLightbox'

interface AvatarWithLightboxProps {
  src: string
  alt: string
  isCustom?: boolean
  lightboxShape?: 'circle' | 'rounded'
  interactive?: boolean
  className?: string
  style?: React.CSSProperties
}

export function AvatarWithLightbox({
  src,
  alt,
  isCustom = false,
  lightboxShape = 'circle',
  interactive = true,
  className = '',
  style,
}: AvatarWithLightboxProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!interactive) {
    return (
      <div className={className} style={style}>
        <img
          src={src}
          alt={alt}
          className={`w-full h-full ${isCustom ? 'object-cover' : 'object-contain'}`}
        />
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        aria-label={`Enlarge ${alt}`}
        className={`${className} cursor-pointer transition-transform duration-150 hover:scale-[1.03] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF5C00]`}
        style={style}
      >
        <img
          src={src}
          alt={alt}
          className={`w-full h-full ${isCustom ? 'object-cover' : 'object-contain'}`}
        />
      </button>

      <AvatarLightbox
        isOpen={isLightboxOpen}
        src={src}
        alt={alt}
        isCustom={isCustom}
        shape={lightboxShape}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  )
}
