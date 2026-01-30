'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/react'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils/format'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MoreVertical, Copy, Edit, Trash, Share, History } from 'lucide-react'
import { ShareModal } from './ShareModal'
import { VersionHistory } from './VersionHistory'

interface PromptDetailProps {
  promptId: string
}

export function PromptDetail({ promptId }: PromptDetailProps) {
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: prompt, isLoading, error } = trpc.prompt.get.useQuery({ id: promptId })

  const deleteMutation = trpc.prompt.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard')
    },
  })

  const duplicateMutation = trpc.prompt.duplicate.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/prompts/${data.id}`)
    },
  })

  const handleCopy = async () => {
    if (prompt) {
      await navigator.clipboard.writeText(prompt.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDuplicate = () => {
    duplicateMutation.mutate({ id: promptId })
  }

  const handleDelete = () => {
    deleteMutation.mutate({ id: promptId })
    setShowDeleteDialog(false)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="h-64 animate-pulse rounded bg-neutral-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
        <p className="text-semantic-error">Failed to load prompt: {error.message}</p>
      </div>
    )
  }

  if (!prompt) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <p className="text-neutral-600">Prompt not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-neutral-900">{prompt.title}</h1>
            <span className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700">
              {prompt.contentType}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-medium text-neutral-700">
              {prompt.visibility}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-neutral-600">
            <span>by {prompt.owner.name ?? prompt.owner.email}</span>
            <span>•</span>
            <span>Updated {formatDateTime(prompt.updatedAt)}</span>
            {prompt.folder && (
              <>
                <span>•</span>
                <span>in {prompt.folder.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopy}>
            <Copy className="mr-2 h-4 w-4" />
            {copied ? 'Copied!' : 'Copy'}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/dashboard/prompts/${promptId}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                <Share className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                <History className="mr-2 h-4 w-4" />
                Version History
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-semantic-error"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">Content</h2>
        <pre className="whitespace-pre-wrap font-sans text-neutral-700">{prompt.content}</pre>
      </div>

      {/* Content URL */}
      {prompt.contentUrl && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-2 text-lg font-semibold text-neutral-900">Content URL</h2>
          <a
            href={prompt.contentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:underline"
          >
            {prompt.contentUrl}
          </a>
        </div>
      )}

      {/* Usage Notes */}
      {prompt.usageNotes && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Usage Notes</h2>
          <p className="text-neutral-700">{prompt.usageNotes}</p>
        </div>
      )}

      {/* Variables */}
      {prompt.variables && Array.isArray(prompt.variables) && prompt.variables.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Variables</h2>
          <div className="space-y-3">
            {(prompt.variables as Array<{ name: string; description: string }>).map((variable, index) => (
              <div key={index} className="rounded-md bg-neutral-50 p-3">
                <span className="font-mono text-sm font-medium text-primary-700">
                  {variable.name}
                </span>
                <p className="mt-1 text-sm text-neutral-600">{variable.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Example I/O */}
      {prompt.exampleIO && Array.isArray(prompt.exampleIO) && prompt.exampleIO.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Examples</h2>
          <div className="space-y-4">
            {(prompt.exampleIO as Array<{ input: string; output: string }>).map((example, index) => (
              <div key={index} className="space-y-2">
                <div className="rounded-md bg-neutral-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase text-neutral-500">Input</p>
                  <pre className="whitespace-pre-wrap font-mono text-sm text-neutral-700">
                    {example.input}
                  </pre>
                </div>
                <div className="rounded-md bg-primary-50 p-4">
                  <p className="mb-1 text-xs font-medium uppercase text-neutral-500">Output</p>
                  <pre className="whitespace-pre-wrap font-mono text-sm text-neutral-700">
                    {example.output}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Co-creators */}
      {prompt.coCreators && prompt.coCreators.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Co-creators</h2>
          <div className="space-y-2">
            {prompt.coCreators.map((coCreator) => (
              <div key={coCreator.id} className="flex items-center gap-3">
                {coCreator.user.image ? (
                  <img
                    src={coCreator.user.image}
                    alt={coCreator.user.name ?? 'User'}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {coCreator.user.name?.charAt(0) ?? coCreator.user.email?.charAt(0) ?? 'U'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-neutral-900">
                    {coCreator.user.name ?? coCreator.user.email}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Added {formatDateTime(coCreator.addedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        promptId={promptId}
        currentVisibility={prompt.visibility}
        coCreators={prompt.coCreators}
        teamAccess={prompt.teamAccess}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />

      {/* Version History */}
      <VersionHistory
        promptId={promptId}
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Prompt</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this prompt? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
