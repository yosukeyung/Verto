'use client'

import { useState } from 'react'
import { Radio } from 'lucide-react'
import type { TagRow } from '@/types/database'
import { TagSelector } from '@/components/dashboard/TagSelector'
import { TagSettingsForm } from '@/components/dashboard/TagSettingsForm'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/layout/Navbar'
import { ProfileModal } from '@/components/ui/ProfileModal'
import { ThemeSwitch } from '@/components/ui/ThemeSwitch'
import { DashboardTutorial } from '@/components/dashboard/DashboardTutorial'
import { signOutAction } from '@/app/dashboard/actions'
import { UserProvider, useUser, type UserProfile } from '@/components/providers/UserContext'

interface DashboardManagerProps {
  initialTags: TagRow[]
  userEmail: string
  userId?: string
  hasCompletedOnboarding?: boolean
  initialSelectedTagId?: string
  initialProfile: UserProfile
}

function DashboardContent({
  initialTags,
  userEmail,
  userId,
  hasCompletedOnboarding,
  initialSelectedTagId,
}: Omit<DashboardManagerProps, 'initialProfile'>) {
  const { profile } = useUser()
  const [tags, setTags] = useState<TagRow[]>(initialTags)
  const [selectedTagId, setSelectedTagId] = useState<string>(
    initialSelectedTagId && initialTags.some((t) => t.tag_id === initialSelectedTagId)
      ? initialSelectedTagId
      : initialTags[0]?.tag_id || ''
  )

  const activeTag = tags.find((t) => t.tag_id === selectedTagId)

  const handleSelectTag = (tagId: string) => {
    setSelectedTagId(tagId)
  }

  const handleSaveSuccess = (updatedTag: TagRow) => {
    setTags((prev) =>
      prev.map((t) => (t.tag_id === updatedTag.tag_id ? updatedTag : t))
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col">
      {/* Onboarding Tutorial */}
      <DashboardTutorial
        hasTags={tags.length > 0}
        userId={userId}
        initialHasCompletedOnboarding={hasCompletedOnboarding}
      />

      {/* Top Navbar */}
      <Navbar
        rightAction={
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <ProfileModal
              onSignOut={() => {
                try {
                  localStorage.removeItem('hasSeenTutorial')
                  Object.keys(localStorage).forEach((key) => {
                    if (key.startsWith('hasSeenTutorial')) {
                      localStorage.removeItem(key)
                    }
                  })
                } catch {
                  // Ignore localStorage error
                }
                signOutAction()
              }}
            />
          </div>
        }
      />

      {/* Main Content Area: Centered, Focused Mobile-First Layout */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-18 pb-16 space-y-6">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <div className="w-8 border-b border-orange-500 mt-2" />
        </div>

        {/* Empty State per DESIGN.md Section 14 */}
        {tags.length === 0 ? (
          <Card className="text-center py-12 px-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-neutral-900 flex items-center justify-center mx-auto mb-4 text-gray-500 dark:text-neutral-400">
              <Radio className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No tags connected yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
              You have not claimed any tags yet. Tap an NFC tag to start registration, or contact support.
            </p>
          </Card>
        ) : activeTag ? (
          <>
            {/* Tag Selector Chips */}
            <TagSelector
              tags={tags}
              selectedTagId={selectedTagId}
              onSelectTag={handleSelectTag}
            />

            {/* Public URL display */}
            <div className="py-2 px-3 rounded-lg bg-gray-50 border border-gray-200 dark:bg-neutral-950 dark:border-neutral-800">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-600 dark:text-neutral-400">
                <span>Public URL:</span>
                <span className="font-semibold text-gray-900 dark:text-white">/t/{selectedTagId}</span>
              </div>
            </div>

            {/* Tag Settings Form (Single Column Vertical Stack with Tabbed Controls & Action Buttons) */}
            <TagSettingsForm
              key={selectedTagId}
              activeTag={activeTag}
              profileFullName={profile.full_name}
              onSaveSuccess={handleSaveSuccess}
            />
          </>
        ) : null}
      </main>
    </div>
  )
}

export function DashboardManager({
  initialTags,
  userEmail,
  userId,
  hasCompletedOnboarding,
  initialSelectedTagId,
  initialProfile,
}: DashboardManagerProps) {
  return (
    <UserProvider initialProfile={initialProfile}>
      <DashboardContent
        initialTags={initialTags}
        userEmail={userEmail}
        userId={userId}
        hasCompletedOnboarding={hasCompletedOnboarding}
        initialSelectedTagId={initialSelectedTagId}
      />
    </UserProvider>
  )
}
