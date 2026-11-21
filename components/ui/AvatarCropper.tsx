'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ZoomIn, Move, Loader2 } from 'lucide-react'

const CROP_VIEW_SIZE = 208
const DEFAULT_OUTPUT_SIZE = 400
const IMAGE_QUALITY = 0.82

interface AvatarCropperProps {
  imageSrc: string
  shape?: 'circle' | 'square'
  outputSize?: number
  hintText?: string
  onCancel: () => void
  onComplete: (blob: Blob) => void
}

export function AvatarCropper({
  imageSrc,
  shape = 'circle',
  outputSize = DEFAULT_OUTPUT_SIZE,
  hintText,
  onCancel,
  onComplete,
}: AvatarCropperProps) {
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; origX: number; origY: number } | null>(null)

  const baseScale = naturalSize
    ? Math.max(CROP_VIEW_SIZE / naturalSize.w, CROP_VIEW_SIZE / naturalSize.h)
    : 1

  const displayW = naturalSize ? naturalSize.w * baseScale * zoom : CROP_VIEW_SIZE
  const displayH = naturalSize ? naturalSize.h * baseScale * zoom : CROP_VIEW_SIZE

  const clampOffset = useCallback(
    (x: number, y: number, currentZoom: number) => {
      if (!naturalSize) return { x: 0, y: 0 }
      const scale = Math.max(CROP_VIEW_SIZE / naturalSize.w, CROP_VIEW_SIZE / naturalSize.h)
      const w = naturalSize.w * scale * currentZoom
      const h = naturalSize.h * scale * currentZoom
      const maxX = Math.max(0, (w - CROP_VIEW_SIZE) / 2)
      const maxY = Math.max(0, (h - CROP_VIEW_SIZE) / 2)
      return {
        x: Math.min(maxX, Math.max(-maxX, x)),
        y: Math.min(maxY, Math.max(-maxY, y)),
      }
    },
    [naturalSize]
  )

  useEffect(() => {
    setOffset((prev) => clampOffset(prev.x, prev.y, zoom))
  }, [zoom, clampOffset])

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget
    setLoadError(null)
    setNaturalSize({ w: target.naturalWidth, h: target.naturalHeight })
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  const handleImageError = () => {
    setNaturalSize(null)
    setLoadError('Unable to decode this image format. Please choose a JPEG, PNG, or WebP photo.')
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: offset.x,
      origY: offset.y,
    }
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setOffset(clampOffset(dragStartRef.current.origX + dx, dragStartRef.current.origY + dy, zoom))
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setIsDragging(false)
    dragStartRef.current = null
  }

  const handleDone = () => {
    const img = imgRef.current
    if (!img || !naturalSize || isExporting) return
    setIsExporting(true)

    try {
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setIsExporting(false)
        return
      }

      const ratio = outputSize / CROP_VIEW_SIZE
      const drawW = displayW * ratio
      const drawH = displayH * ratio
      const drawX = (outputSize - drawW) / 2 + offset.x * ratio
      const drawY = (outputSize - drawH) / 2 + offset.y * ratio

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, drawX, drawY, drawW, drawH)

      canvas.toBlob(
        (webpBlob) => {
          if (webpBlob && webpBlob.type === 'image/webp') {
            setIsExporting(false)
            onComplete(webpBlob)
            return
          }

          // iOS Safari fallback: toBlob('image/webp') silently falls back to PNG; re-encode as JPEG
          canvas.toBlob(
            (jpegBlob) => {
              setIsExporting(false)
              if (jpegBlob) {
                onComplete(jpegBlob)
              }
            },
            'image/jpeg',
            IMAGE_QUALITY
          )
        },
        'image/webp',
        IMAGE_QUALITY
      )
    } catch {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-between px-5 py-5">
      <div className="flex-1 flex flex-col items-center justify-center space-y-5">
        {/* Crop Mask Area */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-52 h-52 ${
            shape === 'square' ? 'rounded-2xl' : 'rounded-full'
          } overflow-hidden border-2 border-[#FF5C00] bg-neutral-950 shadow-inner touch-none select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          role="application"
          aria-label="Drag to reposition photo"
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="Crop preview"
            draggable={false}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="absolute max-w-none pointer-events-none select-none"
            style={{
              left: '50%',
              top: '50%',
              width: `${displayW}px`,
              height: `${displayH}px`,
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
            }}
          />
        </div>

        <p className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-400">
          <Move className="w-3.5 h-3.5" strokeWidth={1.75} />
          <span>
            {hintText ||
              (shape === 'square'
                ? 'Drag to frame photo inside square'
                : 'Drag to reposition inside circle')}
          </span>
        </p>

        {loadError && (
          <p role="alert" className="text-xs text-center text-red-600 dark:text-red-400 font-medium">
            {loadError}
          </p>
        )}

        {/* Zoom Slider */}
        <div className="w-full max-w-[240px] flex items-center gap-3">
          <ZoomIn className="w-4 h-4 text-gray-400 dark:text-neutral-500 shrink-0" strokeWidth={1.75} />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            aria-label="Zoom level"
            className="w-full accent-[#FF5C00] cursor-pointer"
          />
          <span className="text-xs font-mono text-gray-500 dark:text-neutral-400 w-9 text-right">
            {zoom.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2.5 pt-4 border-t border-gray-100 dark:border-neutral-800">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-11 px-4 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleDone}
          disabled={!naturalSize || isExporting}
          className="flex-1 h-11 px-4 rounded-lg text-sm font-semibold bg-[#FF5C00] hover:bg-[#e04e00] text-white transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cropping...</span>
            </>
          ) : (
            <span>Done</span>
          )}
        </button>
      </div>
    </div>
  )
}
