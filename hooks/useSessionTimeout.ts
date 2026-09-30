'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SESSION_MAX_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useSessionTimeout() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const startStr = localStorage.getItem('verto_session_start')
      if (!startStr) return

      const startTime = parseInt(startStr, 10)
      if (isNaN(startTime)) return

      if (Date.now() - startTime > SESSION_MAX_MS) {
        // Session expired
        const supabase = createClient()
        await supabase.auth.signOut()
        localStorage.removeItem('verto_session_start')
        
        alert('Your session has expired for security reasons. Please sign in again.')
        
        router.push('/login')
        router.refresh()
      }
    }

    // Check on mount
    checkSession()

    // Check on window focus
    window.addEventListener('focus', checkSession)
    
    return () => {
      window.removeEventListener('focus', checkSession)
    }
  }, [router])
}
