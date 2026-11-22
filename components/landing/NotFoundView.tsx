'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import notFoundAnimation from '@/public/404.json'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type MotionMode = 'pending' | 'animated' | 'reduced'

export function NotFoundView() {
  const [motionMode, setMotionMode] = useState<MotionMode>('pending')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const syncMotionMode = (matches: boolean) => {
      setMotionMode(matches ? 'reduced' : 'animated')
    }

    syncMotionMode(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      syncMotionMode(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <main className="min-h-dvh bg-white flex flex-col justify-between px-4 py-10 sm:py-12">
      <div className="w-full max-w-[400px] mx-auto flex-1 flex flex-col justify-center items-center text-center">
        <div
          className="w-40 sm:w-44 max-w-full aspect-[1080/564] mx-auto flex items-center justify-center"
          aria-hidden="true"
        >
          {motionMode !== 'pending' && (
            <Lottie
              key={motionMode}
              animationData={notFoundAnimation}
              loop={motionMode === 'animated'}
              autoplay={motionMode === 'animated'}
              className="w-full h-full"
            />
          )}
        </div>

        <div className="mt-6 flex flex-col items-center space-y-3">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
            Tag Not Found
          </h1>
          <div className="w-8 border-b border-[#FF5C00]" aria-hidden="true" />
          <p className="text-sm sm:text-base leading-relaxed text-gray-500 max-w-xs">
            This tag has not been registered yet. Please contact support.
          </p>
        </div>
      </div>

      <footer className="text-center pt-8">
        <p className="text-xs text-gray-500 tracking-wide">
          Powered by Verto
        </p>
      </footer>
    </main>
  )
}
