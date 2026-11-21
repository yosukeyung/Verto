import React from 'react'
import type { TagRow } from '@/types/database'
import { getTagDisplayName } from '@/lib/tag-label'

interface TagSelectorProps {
  tags: TagRow[]
  selectedTagId: string
  onSelectTag: (tagId: string) => void
}

export function TagSelector({ tags, selectedTagId, onSelectTag }: TagSelectorProps) {
  if (tags.length <= 1) {
    const activeTag = tags.find((t) => t.tag_id === selectedTagId) ?? tags[0]
    const displayName = getTagDisplayName(activeTag, 0)

    return (
      <div id="tour-tag-selector" className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider shrink-0">
          Active Tag:
        </span>
        <span className="px-3 py-1 rounded-md border border-[#FF5C00] bg-orange-50 dark:bg-orange-500/10 text-sm font-semibold text-orange-700 dark:text-orange-400 max-w-full truncate">
          {displayName}
        </span>
      </div>
    )
  }

  return (
    <div id="tour-tag-selector" className="w-full">
      <div className="text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
        Select Tag ({tags.length})
      </div>
      <div 
        role="tablist"
        aria-label="NFC Tag List"
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {tags.map((tag, index) => {
          const isActive = tag.tag_id === selectedTagId
          const displayName = getTagDisplayName(tag, index)

          return (
            <button
              key={tag.tag_id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTag(tag.tag_id)}
              className={`min-h-11 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                isActive
                  ? 'border border-[#FF5C00] bg-orange-50 text-orange-700 font-semibold dark:bg-orange-500/10 dark:text-orange-400'
                  : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:border-neutral-700'
              }`}
            >
              {displayName}
            </button>
          )
        })}
      </div>
    </div>
  )
}
