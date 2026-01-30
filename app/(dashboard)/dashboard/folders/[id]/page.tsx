'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/react'
import { PromptCard } from '@/components/prompts/PromptCard'
import { Button } from '@/components/ui/button'
import { Edit, Trash } from 'lucide-react'
import { useState, use } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRouter } from 'next/navigation'

export default function FolderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: folder, isLoading, error } = trpc.folder.get.useQuery({ id })

  const deleteMutation = trpc.folder.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard')
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate({ id })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
          <p className="text-semantic-error">Failed to load folder: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-neutral-600">Folder not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{folder.name}</h1>
          {folder.description && (
            <p className="mt-2 text-neutral-600">{folder.description}</p>
          )}
          <p className="mt-2 text-sm text-neutral-500">
            {folder.prompts.length} prompt{folder.prompts.length !== 1 ? 's' : ''}
            {folder.children.length > 0 &&
              ` • ${folder.children.length} subfolder${folder.children.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {folder.children.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Subfolders</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {folder.children.map((child) => (
              <Link
                key={child.id}
                href={`/dashboard/folders/${child.id}`}
                className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-neutral-900">{child.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {folder.prompts.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-neutral-900">No prompts yet</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Create a new prompt or move existing prompts to this folder
          </p>
          <Link href="/dashboard/prompts/new">
            <Button className="mt-4">Create Prompt</Button>
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-neutral-900">Prompts</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {folder.prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              {folder.prompts.length > 0 || folder.children.length > 0
                ? `Cannot delete folder. It contains ${folder.prompts.length} prompts and ${folder.children.length} subfolders. Please move or delete them first.`
                : 'Are you sure you want to delete this folder? This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            {folder.prompts.length === 0 && folder.children.length === 0 && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
