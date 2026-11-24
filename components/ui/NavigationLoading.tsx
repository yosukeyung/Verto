'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter, usePathname } from 'next/navigation'
import catAnimation from '@/public/cat-loading.json'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

export const DEFAULT_OVERLAY_DELAY_MS = 800
const FAILSAFE_RESET_MS = 15000

export function useDelayedNavigation(delayMs: number = DEFAULT_OVERLAY_DELAY_MS) {
  const router = useRouter()
  const pathname = usePathname()
  const [showOverlay, setShowOverlay] = useState(false)
  const [mounted, setMounted] = useState(false)
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const failsafeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current)
      showTimeoutRef.current = null
    }
    if (failsafeTimeoutRef.current) {
      clearTimeout(failsafeTimeoutRef.current)
      failsafeTimeoutRef.current = null
    }
  }, [])

  const resetLoadingState = useCallback(() => {
    clearTimers()
    setShowOverlay(false)
  }, [clearTimers])

  useEffect(() => {
    setMounted(true)
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  useEffect(() => {
    resetLoadingState()
  }, [pathname, resetLoadingState])

  useEffect(() => {
    const handleReset = () => {
      resetLoadingState()
    }
    window.addEventListener('popstate', handleReset)
    window.addEventListener('pagehide', handleReset)
    return () => {
      window.removeEventListener('popstate', handleReset)
      window.removeEventListener('pagehide', handleReset)
    }
  }, [resetLoadingState])

  useEffect(() => {
    if (!showOverlay) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [showOverlay])

  const navigate = useCallback(
    (href: string) => {
      resetLoadingState()

      if (typeof window !== 'undefined') {
        try {
          const targetUrl = new URL(href, window.location.origin)
          if (
            targetUrl.origin === window.location.origin &&
            targetUrl.pathname === window.location.pathname &&
            targetUrl.search === window.location.search
          ) {
            router.push(href)
            return
          }
        } catch {
          // Proceed with standard push if URL parsing fails
        }
      }

      router.push(href)

      showTimeoutRef.current = setTimeout(() => {
        setShowOverlay(true)
      }, delayMs)

      failsafeTimeoutRef.current = setTimeout(() => {
        resetLoadingState()
      }, FAILSAFE_RESET_MS)
    },
    [delayMs, resetLoadingState, router]
  )

  const overlay =
    mounted && showOverlay
      ? createPortal(
          <div
            role="status"
            aria-live="polite"
            aria-label="Loading page"
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm"
          >
            <Lottie
              animationData={catAnimation}
              loop={true}
              className="w-64 h-64 sm:w-80 sm:h-80"
            />
          </div>,
          document.body
        )
      : null

  return { navigate, showOverlay, overlay }
}

export interface LoadingNavLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  delayMs?: number
}

export function LoadingNavLink({
  href,
  delayMs,
  onClick,
  target,
  children,
  ...props
}: LoadingNavLinkProps) {
  const { navigate, overlay } = useDelayedNavigation(delayMs)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (
      e.defaultPrevented ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      target === '_blank'
    ) {
      return
    }
    e.preventDefault()
    navigate(href)
  }

  return (
    <>
      <Link href={href} target={target} onClick={handleClick} {...props}>
        {children}
      </Link>
      {overlay}
    </>
  )
}
