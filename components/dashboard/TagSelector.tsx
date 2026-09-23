import React from 'react'
import type { TagRow } from '@/types/database'

interface TagSelectorProps {
  tags: TagRow[]
  selectedTagId: string
  onSelectTag: (tagId: string) => void
}

export function TagSelector({ tags, selectedTagId, onSelectTag }: TagSelectorProps) {
  if (tags.length <= 1) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          Active Tag:
        </span>
        <span className="px-3 py-1 rounded-md border border-orange-500 bg-orange-50 text-sm font-mono font-medium text-orange-600">
          {selectedTagId}
        </span>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
        Select Tag ({tags.length})
      </div>
      <div 
        role="tablist"
        aria-label="NFC Tag List"
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
      >
        {tags.map((tag) => {
          const isActive = tag.tag_id === selectedTagId
          return (
            <button
              key={tag.tag_id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectTag(tag.tag_id)}
              className={`px-3 py-2 rounded-lg text-sm font-mono font-medium whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
                isActive
                  ? 'border border-orange-500 bg-orange-50 text-orange-600'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              {tag.tag_id}
            </button>
          )
        })}
      </div>
    </div>
  )
}
