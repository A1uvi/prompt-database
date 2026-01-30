'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/react'
import { PromptCard } from '@/components/prompts/PromptCard'
import { SearchFilters } from '@/components/search/SearchFilters'
import { PromptType } from '@prisma/client'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [contentType, setContentType] = useState<PromptType | undefined>()
  const [tags, setTags] = useState<string[]>([])

  const { data: results, isLoading, error } = trpc.prompt.search.useQuery(
    {
      query,
      contentType,
      tags: tags.length > 0 ? tags : undefined,
    },
    {
      enabled: !!query,
    }
  )

  if (!query) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-neutral-900">
            Start searching
          </h3>
          <p className="mt-2 text-sm text-neutral-600">
            Enter a search query to find prompts
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 p-8">
      <SearchFilters
        contentType={contentType}
        tags={tags}
        onContentTypeChange={setContentType}
        onTagsChange={setTags}
      />

      <div className="flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Search Results
          </h1>
          <p className="mt-2 text-neutral-600">
            {isLoading
              ? 'Searching...'
              : `Found ${results?.length || 0} result${results?.length !== 1 ? 's' : ''} for "${query}"`}
          </p>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-lg bg-neutral-100"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
            <p className="text-semantic-error">
              Search failed: {error.message}
            </p>
          </div>
        )}

        {results && results.length === 0 && (
          <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
            <h3 className="text-lg font-semibold text-neutral-900">
              No results found
            </h3>
            <p className="mt-2 text-sm text-neutral-600">
              Try a different search term or remove some filters
            </p>
          </div>
        )}

        {results && results.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
