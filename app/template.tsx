'use client'

import { motion, useReducedMotion } from 'framer-motion'

export default function Template({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full min-h-screen"
    >
      {/* Standalone fading orange flare: GPU-composited opacity only */}
      {!shouldReduceMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute inset-0 -z-10 pointer-events-none bg-orange-500/10 blur-[120px]"
        />
      )}

      {children}
    </motion.div>
  )
}
