'use client'

import { use } from 'react'
import { PromptEditor } from '@/components/prompts/PromptEditor'
import { trpc } from '@/lib/trpc/react'

export default function EditPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: prompt, isLoading, error } = trpc.prompt.get.useQuery({ id })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="h-96 animate-pulse rounded-lg bg-neutral-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
          <p className="text-semantic-error">Failed to load prompt: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="mx-auto max-w-4xl p-8">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-neutral-600">Prompt not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Edit Prompt</h1>
        <p className="mt-2 text-neutral-600">Make changes to your prompt</p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <PromptEditor
          mode="edit"
          initialData={{
            id: prompt.id,
            title: prompt.title,
            content: prompt.content,
            contentUrl: prompt.contentUrl ?? undefined,
            usageNotes: prompt.usageNotes ?? undefined,
            contentType: prompt.contentType,
            variables: prompt.variables as Array<{ name: string; description: string }> | undefined,
            exampleIO: prompt.exampleIO as Array<{ input: string; output: string }> | undefined,
            tags: prompt.tags,
            visibility: prompt.visibility,
            folderId: prompt.folderId ?? undefined,
          }}
        />
      </div>
    </div>
  )
}
