'use client'

import { useEffect, useRef, useCallback } from 'react'
import { driver, type Driver, type DriveStep } from 'driver.js'
import { createClient } from '@/lib/supabase/client'

interface DashboardTutorialProps {
  /** Optional flag: set to false if tags are not yet loaded or empty */
  hasTags?: boolean
  /** Current authenticated user ID to scope localStorage keys */
  userId?: string
  /** Authoritative server-side flag indicating whether user completed onboarding */
  initialHasCompletedOnboarding?: boolean
}

const LEGACY_STORAGE_KEY = 'hasSeenTutorial'

function getStorageKey(uid?: string) {
  return uid ? `hasSeenTutorial_${uid}` : LEGACY_STORAGE_KEY
}

export function DashboardTutorial({
  hasTags = true,
  userId,
  initialHasCompletedOnboarding,
}: DashboardTutorialProps) {
  const driverInstanceRef = useRef<Driver | null>(null)

  const markComplete = useCallback(async () => {
    // 1. Scoped localStorage write to prevent cross-account bleed
    try {
      const key = getStorageKey(userId)
      localStorage.setItem(key, 'true')
      // Purge legacy un-scoped key
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch (e) {
      console.warn('[DashboardTutorial] localStorage write failed:', e)
    }

    // 2. Persist to Supabase user metadata (authoritative source of truth)
    try {
      const supabase = createClient()
      await supabase.auth.updateUser({
        data: {
          has_completed_onboarding: true,
          hasSeenTutorial: true,
        },
      })
    } catch (err) {
      console.warn('[DashboardTutorial] Supabase user metadata update failed:', err)
    }
  }, [userId])

  const startTutorial = useCallback(() => {
    const steps: DriveStep[] = [
      {
        element: '#profile-modal-trigger',
        popover: {
          title: 'Profile',
          description:
            'Set up your identity. Click here to edit your name, choose your red panda avatar, and manage your account.',
          side: 'bottom',
          align: 'end',
        },
      },
      {
        element: '#tour-tag-selector',
        popover: {
          title: 'Active Tag',
          description:
            'Manage multiple tags. Switch between your physical tags here.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-tag-mode',
        popover: {
          title: 'Active Tag Mode',
          description:
            "Choose your tag's destination. Select Social Mode, Lost & Found, or Event Hub.",
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-theme-and-save',
        popover: {
          title: 'Theme Customization & Save',
          description:
            'Customize your look and save your configuration to update your tag instantly.',
          side: 'top',
          align: 'start',
        },
      },
    ]

    const driverObj = driver({
      steps,
      animate: true,
      overlayColor: '#000000',
      overlayOpacity: 0.75,
      stagePadding: 8,
      stageRadius: 12,
      popoverOffset: 12,
      allowClose: true,
      skipMissingElement: true,
      overlayClickBehavior: 'close',
      showButtons: ['next'],
      nextBtnText: 'Next',
      doneBtnText: 'Done',
      popoverClass: 'verto-driver-popover',
      onPopoverRender: (popover, { driver: instance }) => {
        // Ensure the subtle "Skip" button is present on every step
        let skipBtn = popover.footer.querySelector('.verto-tour-skip-btn') as HTMLButtonElement | null
        if (!skipBtn) {
          skipBtn = document.createElement('button')
          skipBtn.type = 'button'
          skipBtn.className = 'verto-tour-skip-btn'
          skipBtn.innerText = 'Skip'
          skipBtn.addEventListener('click', () => {
            instance.destroy()
          })
          popover.footer.insertBefore(skipBtn, popover.footerButtons)
        }
      },
      onDestroyed: () => {
        markComplete()
      },
    })

    driverInstanceRef.current = driverObj
    driverObj.drive()
  }, [markComplete])

  useEffect(() => {
    // Only trigger if tags exist (the 4-step tour targets tag controls)
    if (!hasTags) return

    // 1. Authoritative check: if server confirmed user completed onboarding, exit immediately
    if (initialHasCompletedOnboarding === true) {
      return
    }

    // 2. Fast check: user-scoped localStorage (never generic un-scoped key)
    if (userId) {
      try {
        const localSeen = localStorage.getItem(getStorageKey(userId))
        if (localSeen === 'true') {
          return
        }
      } catch {
        // localStorage may fail in restricted/private modes
      }
    }

    let isCancelled = false

    // 3. Fallback verification against Supabase user metadata (if not already verified server-side)
    const verifyAndTrigger = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        const isCompleted = Boolean(
          user?.user_metadata?.has_completed_onboarding || user?.user_metadata?.hasSeenTutorial
        )

        if (isCompleted) {
          if (user?.id) {
            try {
              localStorage.setItem(getStorageKey(user.id), 'true')
            } catch {}
          }
          return
        }
      } catch (err) {
        console.warn('[DashboardTutorial] Supabase verification error:', err)
      }

      if (isCancelled) return

      // Allow DOM elements time to render completely
      const timer = setTimeout(() => {
        if (isCancelled) return
        startTutorial()
      }, 500)

      return () => clearTimeout(timer)
    }

    verifyAndTrigger()

    return () => {
      isCancelled = true
      if (driverInstanceRef.current?.isActive()) {
        driverInstanceRef.current.destroy()
      }
    }
  }, [hasTags, userId, initialHasCompletedOnboarding, startTutorial])

  return null
}
