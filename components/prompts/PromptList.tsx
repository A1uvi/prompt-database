'use client'

import Link from 'next/link'
import { PromptCard } from './PromptCard'
import { trpc } from '@/lib/trpc/react'
import { Button } from '@/components/ui/button'

export function PromptList() {
  const { data, isLoading, error } = trpc.prompt.list.useQuery({})

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-lg bg-neutral-100"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
        <p className="text-semantic-error">
          Failed to load prompts: {error.message}
        </p>
      </div>
    )
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">
          No prompts yet
        </h3>
        <p className="mt-2 text-sm text-neutral-600">
          Create your first prompt to get started
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/dashboard/prompts/new">New Prompt</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/dashboard/prompts/new">New Prompt</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} />
        ))}
      </div>
    </div>
  )
}
