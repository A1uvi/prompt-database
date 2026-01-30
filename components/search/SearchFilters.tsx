'use client'

import { PromptType } from '@prisma/client'
import { Label } from '@/components/ui/label'

interface SearchFiltersProps {
  contentType?: PromptType
  tags?: string[]
  onContentTypeChange: (type: PromptType | undefined) => void
  onTagsChange: (tags: string[]) => void
}

export function SearchFilters({
  contentType,
  tags,
  onContentTypeChange,
  onTagsChange,
}: SearchFiltersProps) {
  const contentTypes: PromptType[] = [
    'PROMPT',
    'TEMPLATE',
    'CONVERSATION',
    'CONVERSATION_SUMMARY',
    'META_NOTE',
    'PROMPT_WITH_EXAMPLES',
  ]

  return (
    <aside className="w-64 space-y-6 rounded-lg border border-neutral-200 bg-white p-6">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-neutral-900">Filters</h3>

        <div className="space-y-4">
          {/* Content Type Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase text-neutral-500">
              Content Type
            </Label>
            <select
              value={contentType || ''}
              onChange={(e) =>
                onContentTypeChange(
                  e.target.value ? (e.target.value as PromptType) : undefined
                )
              }
              className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <option value="">All Types</option>
              {contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(contentType || (tags && tags.length > 0)) && (
            <button
              onClick={() => {
                onContentTypeChange(undefined)
                onTagsChange([])
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
