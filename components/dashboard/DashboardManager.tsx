'use client'

import { useState, useEffect } from 'react'
import { Radio } from 'lucide-react'
import type { TagRow } from '@/types/database'
import { TagSelector } from '@/components/dashboard/TagSelector'
import { TagSettingsForm } from '@/components/dashboard/TagSettingsForm'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/layout/Navbar'
import { ProfileModal } from '@/components/ui/ProfileModal'
import { DashboardTutorial } from '@/components/dashboard/DashboardTutorial'
import { signOutAction } from '@/app/dashboard/actions'
import { useSessionTimeout } from '@/hooks/useSessionTimeout'

interface DashboardManagerProps {
  initialTags: TagRow[]
  userEmail: string
  initialSelectedTagId?: string
}

export function DashboardManager({
  initialTags,
  userEmail,
  initialSelectedTagId,
}: DashboardManagerProps) {
  useSessionTimeout()
  
  const [tags, setTags] = useState<TagRow[]>(initialTags)
  const [selectedTagId, setSelectedTagId] = useState<string>(
    initialSelectedTagId && initialTags.some((t) => t.tag_id === initialSelectedTagId)
      ? initialSelectedTagId
      : initialTags[0]?.tag_id || ''
  )
  const [profileFullName, setProfileFullName] = useState<string>('')

  const activeTag = tags.find((t) => t.tag_id === selectedTagId)

  // Load profile full_name for auto-populating new tags
  useEffect(() => {
    fetch('/api/profile')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.full_name) setProfileFullName(data.full_name)
      })
      .catch(() => {})
  }, [])

  const handleSelectTag = (tagId: string) => {
    setSelectedTagId(tagId)
  }

  const handleSaveSuccess = (updatedTag: TagRow) => {
    setTags((prev) =>
      prev.map((t) => (t.tag_id === updatedTag.tag_id ? updatedTag : t))
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Onboarding Tutorial */}
      <DashboardTutorial hasTags={tags.length > 0} />

      {/* Top Navbar */}
      <Navbar
        rightAction={
          <ProfileModal
            onSignOut={() => {
              signOutAction()
            }}
          />
        }
      />

      {/* Main Content Area: Centered, Focused Mobile-First Layout */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-18 pb-16 space-y-6">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-gray-900">
            Dashboard
          </h1>
          <div className="w-8 border-b border-orange-500 mt-2" />
        </div>

        {/* Empty State per DESIGN.md Section 14 */}
        {tags.length === 0 ? (
          <Card className="text-center py-12 px-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
              <Radio className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No tags connected yet
            </h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
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
            <div className="py-2 px-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
                <span>Public URL:</span>
                <span className="font-semibold text-gray-900">/t/{selectedTagId}</span>
              </div>
            </div>

            {/* Tag Settings Form (Single Column Vertical Stack with Tabbed Controls & Action Buttons) */}
            <TagSettingsForm
              key={selectedTagId}
              activeTag={activeTag}
              profileFullName={profileFullName}
              onSaveSuccess={handleSaveSuccess}
            />
          </>
        ) : null}
      </main>
    </div>
  )
}
