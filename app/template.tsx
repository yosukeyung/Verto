'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative w-full min-h-screen"
    >
      {/* Ambient Orange Light Leak / Camera Flash Flare */}
      {!shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{
            duration: 0.65,
            times: [0, 0.12, 1],
            ease: 'easeOut',
          }}
          className="pointer-events-none fixed inset-x-0 top-0 z-50 overflow-hidden flex flex-col items-center origin-top"
        >
          {/* Luminous orange horizon beam */}
          <div className="w-full h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent shadow-[0_0_12px_rgba(249,115,22,0.8)]" />

          {/* Diffuse ambient radial light leak aura */}
          <div
            className="w-full max-w-4xl h-80 -mt-2 blur-2xl"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(249, 115, 22, 0.55) 0%, rgba(249, 115, 22, 0.25) 45%, rgba(249, 115, 22, 0.05) 75%, transparent 100%)',
            }}
          />
        </motion.div>
      )}

      {children}
    </motion.div>
  )
}
