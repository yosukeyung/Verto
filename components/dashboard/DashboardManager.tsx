'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ExternalLink, Loader2, LogOut, Radio } from 'lucide-react'
import type { TagRow, ActiveMode } from '@/types/database'
import { TagSelector } from '@/components/dashboard/TagSelector'
import { ModeSelector } from '@/components/dashboard/ModeSelector'
import { ModeFormDispatcher } from '@/components/dashboard/ModeForms'
import { Button } from '@/components/ui/Button'
import { Toast, type ToastType } from '@/components/ui/Toast'
import { Card } from '@/components/ui/Card'
import { Navbar } from '@/components/layout/Navbar'
import { saveTagSettings, signOutAction } from '@/app/dashboard/actions'

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
  const [tags, setTags] = useState<TagRow[]>(initialTags)
  const [selectedTagId, setSelectedTagId] = useState<string>(
    initialSelectedTagId && initialTags.some(t => t.tag_id === initialSelectedTagId)
      ? initialSelectedTagId
      : initialTags[0]?.tag_id || ''
  )

  const activeTag = tags.find((t) => t.tag_id === selectedTagId)

  const [activeMode, setActiveMode] = useState<ActiveMode>(
    activeTag?.active_mode || 'social'
  )
  const [metadata, setMetadata] = useState<Record<string, any>>(
    (activeTag?.metadata as Record<string, any>) || {}
  )

  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null)

  // Sync state whenever the selected tag changes
  useEffect(() => {
    if (activeTag) {
      setActiveMode(activeTag.active_mode)
      setMetadata((activeTag.metadata as Record<string, any>) || {})
    }
  }, [selectedTagId, activeTag])

  const handleSelectTag = (tagId: string) => {
    setSelectedTagId(tagId)
    setToast(null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTagId) return

    setIsSaving(true)
    setToast(null)

    const res = await saveTagSettings(selectedTagId, activeMode, metadata)

    if (res?.error) {
      setToast({ type: 'error', message: res.error })
      setIsSaving(false)
      return
    }

    // Update local state
    setTags((prev) =>
      prev.map((t) =>
        t.tag_id === selectedTagId
          ? { ...t, active_mode: activeMode, metadata, updated_at: new Date().toISOString() }
          : t
      )
    )

    setToast({ type: 'success', message: 'Tag settings saved successfully.' })
    setIsSaving(false)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navbar */}
      <Navbar
        rightAction={
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden sm:inline">{userEmail}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Sign Out"
                title="Sign out of account"
                className="p-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.75} />
              </button>
            </form>
          </div>
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-6 pb-16 space-y-6">
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
        ) : (
          <>
            {/* Tag Selector Chips */}
            <TagSelector
              tags={tags}
              selectedTagId={selectedTagId}
              onSelectTag={handleSelectTag}
            />

            {/* Public Link Preview Quick-Action */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-600">
                <span>Public URL:</span>
                <span className="font-semibold text-gray-900">/t/{selectedTagId}</span>
              </div>
              <a
                href={`/t/${selectedTagId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 hover:underline"
              >
                <span>Open View</span>
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
              </a>
            </div>

            {/* Form & Mode Controls */}
            <form onSubmit={handleSave} className="space-y-6">
              <ModeSelector
                activeMode={activeMode}
                onChangeMode={(newMode) => {
                  setActiveMode(newMode)
                  setToast(null)
                }}
              />

              <div className="pt-2 border-t border-gray-200">
                <div className="text-sm font-semibold text-gray-900 mb-4">
                  {activeMode === 'social' ? 'Social Profile Settings' : activeMode === 'lost_and_found' ? 'Lost & Found Settings' : 'Event Settings'}
                </div>

                <ModeFormDispatcher
                  activeMode={activeMode}
                  metadata={metadata}
                  onChangeMetadata={(newMeta) => setMetadata(newMeta)}
                />
              </div>

              {/* Toast Feedback */}
              {toast && (
                <Toast
                  type={toast.type}
                  message={toast.message}
                  onClose={() => setToast(null)}
                />
              )}

              {/* Save Button (Primary CTA) */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSaving}
                  className="w-full"
                >
                  Save Settings
                </Button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  )
}
