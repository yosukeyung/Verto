'use client'

import { useEffect, useState, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { finished: Promise<void> }
}

const FADE_MS = 220

export function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? 'light' : 'dark'
    const root = document.documentElement

    // Keyboard activation reports clientX/Y = 0, so fall back to the switch centre.
    const rect = e.currentTarget.getBoundingClientRect()
    const fromPointer = e.detail > 0
    const x = fromPointer ? e.clientX : rect.left + rect.width / 2
    const y = fromPointer ? e.clientY : rect.top + rect.height / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // next-themes applies the class in an effect; set it directly as well so the
    // DOM is guaranteed to be in the new state when the transition snapshots it.
    const applyTheme = () => {
      flushSync(() => setTheme(next))
      root.classList.toggle('dark', next === 'dark')
      root.classList.toggle('light', next === 'light')
      root.style.colorScheme = next
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyTheme()
      return
    }

    const doc = document as ViewTransitionDocument
    if (typeof doc.startViewTransition !== 'function') {
      root.classList.add('theme-fade')
      applyTheme()
      window.setTimeout(() => root.classList.remove('theme-fade'), FADE_MS)
      return
    }

    root.style.setProperty('--theme-x', `${x}px`)
    root.style.setProperty('--theme-y', `${y}px`)
    root.style.setProperty('--theme-r', `${radius}px`)
    root.classList.add('theme-transition')

    const transition = doc.startViewTransition(applyTheme)
    transition.finished.finally(() => {
      root.classList.remove('theme-transition')
    })
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={handleClick}
      disabled={!mounted}
      className={`relative w-12 h-7 rounded-full border transition-colors duration-200 flex items-center p-0.5 cursor-pointer disabled:cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black ${
        isDark
          ? 'bg-neutral-900 border-neutral-700 justify-end'
          : 'bg-gray-100 border-gray-200 justify-start'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-sm ${
          isDark ? 'bg-orange-500 text-black' : 'bg-white text-gray-700'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5" strokeWidth={2.25} />
        ) : (
          <Sun className="w-3.5 h-3.5" strokeWidth={2.25} />
        )}
      </motion.span>
    </button>
  )
}
