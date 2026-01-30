'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PromptType, Visibility } from '@prisma/client'
import { X, Plus } from 'lucide-react'

interface PromptEditorProps {
  initialData?: {
    id?: string
    title: string
    content: string
    contentUrl?: string
    usageNotes?: string
    contentType: PromptType
    variables?: Array<{ name: string; description: string }>
    exampleIO?: Array<{ input: string; output: string }>
    tags?: string[]
    visibility: Visibility
    folderId?: string
  }
  mode: 'create' | 'edit'
}

export function PromptEditor({ initialData, mode }: PromptEditorProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [contentUrl, setContentUrl] = useState(initialData?.contentUrl ?? '')
  const [usageNotes, setUsageNotes] = useState(initialData?.usageNotes ?? '')
  const [contentType, setContentType] = useState<PromptType>(
    initialData?.contentType ?? 'PROMPT'
  )
  const [visibility, setVisibility] = useState<Visibility>(
    initialData?.visibility ?? 'PRIVATE'
  )
  const [variables, setVariables] = useState<
    Array<{ name: string; description: string }>
  >(initialData?.variables ?? [])
  const [exampleIO, setExampleIO] = useState<
    Array<{ input: string; output: string }>
  >(initialData?.exampleIO ?? [])
  const [tags, setTags] = useState<string[]>(initialData?.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  const createMutation = trpc.prompt.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/prompts/${data.id}`)
    },
  })

  const updateMutation = trpc.prompt.update.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/prompts/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      title,
      content,
      contentUrl: contentUrl || undefined,
      usageNotes: usageNotes || undefined,
      contentType,
      visibility,
      variables: variables.length > 0 ? variables : undefined,
      exampleIO: exampleIO.length > 0 ? exampleIO : undefined,
      tags: tags.length > 0 ? tags : undefined,
    }

    if (mode === 'create') {
      createMutation.mutate(data)
    } else if (initialData?.id) {
      updateMutation.mutate({ ...data, id: initialData.id })
    }
  }

  const addVariable = () => {
    setVariables([...variables, { name: '', description: '' }])
  }

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const updateVariable = (
    index: number,
    field: 'name' | 'description',
    value: string
  ) => {
    const updated = [...variables]
    updated[index][field] = value
    setVariables(updated)
  }

  const addExample = () => {
    setExampleIO([...exampleIO, { input: '', output: '' }])
  }

  const removeExample = (index: number) => {
    setExampleIO(exampleIO.filter((_, i) => i !== index))
  }

  const updateExample = (
    index: number,
    field: 'input' | 'output',
    value: string
  ) => {
    const updated = [...exampleIO]
    updated[index][field] = value
    setExampleIO(updated)
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const error = createMutation.error || updateMutation.error

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-4">
          <p className="text-sm text-semantic-error">{error.message}</p>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter prompt title"
          required
        />
      </div>

      {/* Content Type */}
      <div className="space-y-2">
        <Label htmlFor="contentType">Type</Label>
        <select
          id="contentType"
          value={contentType}
          onChange={(e) => setContentType(e.target.value as PromptType)}
          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <option value="PROMPT">Prompt</option>
          <option value="TEMPLATE">Template</option>
          <option value="CONVERSATION">Conversation</option>
          <option value="CONVERSATION_SUMMARY">Conversation Summary</option>
          <option value="META_NOTE">Meta Note</option>
          <option value="PROMPT_WITH_EXAMPLES">Prompt with Examples</option>
        </select>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter prompt content"
          rows={8}
          required
        />
      </div>

      {/* Content URL (optional) */}
      <div className="space-y-2">
        <Label htmlFor="contentUrl">Content URL (optional)</Label>
        <Input
          id="contentUrl"
          type="url"
          value={contentUrl}
          onChange={(e) => setContentUrl(e.target.value)}
          placeholder="https://example.com/content"
        />
      </div>

      {/* Usage Notes */}
      <div className="space-y-2">
        <Label htmlFor="usageNotes">Usage Notes</Label>
        <Textarea
          id="usageNotes"
          value={usageNotes}
          onChange={(e) => setUsageNotes(e.target.value)}
          placeholder="Add notes on how to use this prompt"
          rows={4}
        />
      </div>

      {/* Variables */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Variables</Label>
          <Button type="button" size="sm" variant="outline" onClick={addVariable}>
            <Plus className="mr-2 h-4 w-4" />
            Add Variable
          </Button>
        </div>
        {variables.map((variable, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Variable name"
              value={variable.name}
              onChange={(e) => updateVariable(index, 'name', e.target.value)}
            />
            <Input
              placeholder="Description"
              value={variable.description}
              onChange={(e) =>
                updateVariable(index, 'description', e.target.value)
              }
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => removeVariable(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Example I/O */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Example Input/Output</Label>
          <Button type="button" size="sm" variant="outline" onClick={addExample}>
            <Plus className="mr-2 h-4 w-4" />
            Add Example
          </Button>
        </div>
        {exampleIO.map((example, index) => (
          <div key={index} className="space-y-2 rounded-lg border border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Example {index + 1}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeExample(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Input"
              value={example.input}
              onChange={(e) => updateExample(index, 'input', e.target.value)}
              rows={3}
            />
            <Textarea
              placeholder="Output"
              value={example.output}
              onChange={(e) => updateExample(index, 'output', e.target.value)}
              rows={3}
            />
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tagInput">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder="Add tag and press Enter"
          />
          <Button type="button" onClick={addTag}>
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="flex h-10 w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <option value="PRIVATE">Private</option>
          <option value="PUBLIC">Public</option>
          <option value="TEAM">Team</option>
        </select>
      </div>

      {/* Submit buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : mode === 'create' ? 'Create Prompt' : 'Update Prompt'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
