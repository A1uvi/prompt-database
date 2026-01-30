'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { trpc } from '@/lib/trpc/react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface FolderNode {
  id: string
  name: string
  children: FolderNode[]
  prompts: { id: string }[]
}

export function FolderTree() {
  const pathname = usePathname()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')

  const { data: folders, isLoading, refetch } = trpc.folder.list.useQuery()
  const createMutation = trpc.folder.create.useMutation({
    onSuccess: () => {
      refetch()
      setShowNewFolderDialog(false)
      setNewFolderName('')
      setNewFolderDescription('')
    },
  })

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name: newFolderName,
      description: newFolderDescription || undefined,
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-neutral-100" />
        ))}
      </div>
    )
  }

  // Build tree structure
  const folderMap = new Map<string, FolderNode>()
  const rootFolders: FolderNode[] = []

  folders?.forEach((folder) => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      children: [],
      prompts: folder.prompts,
    })
  })

  folders?.forEach((folder) => {
    const node = folderMap.get(folder.id)!
    if (folder.parentId) {
      const parent = folderMap.get(folder.parentId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      rootFolders.push(node)
    }
  })

  const renderFolder = (folder: FolderNode, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id)
    const isActive = pathname === `/dashboard/folders/${folder.id}`
    const hasChildren = folder.children.length > 0

    return (
      <div key={folder.id}>
        <div
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-primary-50 text-primary-700'
              : 'text-neutral-700 hover:bg-neutral-100',
            level > 0 && 'ml-4'
          )}
        >
          {hasChildren && (
            <button
              onClick={() => toggleFolder(folder.id)}
              className="hover:bg-neutral-200 rounded p-0.5"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          {isExpanded ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
          <Link href={`/dashboard/folders/${folder.id}`} className="flex-1">
            <span className="font-medium">{folder.name}</span>
            {folder.prompts.length > 0 && (
              <span className="ml-2 text-xs text-neutral-500">
                ({folder.prompts.length})
              </span>
            )}
          </Link>
        </div>
        {isExpanded && folder.children.length > 0 && (
          <div className="mt-1">
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="border-t border-neutral-200">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Folders</h2>
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="rounded-md p-1 hover:bg-neutral-100"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {rootFolders.length === 0 ? (
          <div className="px-4 pb-4">
            <p className="text-sm text-neutral-500">No folders yet</p>
          </div>
        ) : (
          <div className="space-y-1 px-2 pb-4">
            {rootFolders.map((folder) => renderFolder(folder))}
          </div>
        )}
      </div>

      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Name *</Label>
              <Input
                id="folderName"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="folderDescription">Description</Label>
              <Textarea
                id="folderDescription"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                placeholder="Add a description (optional)"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewFolderDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Folder'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
