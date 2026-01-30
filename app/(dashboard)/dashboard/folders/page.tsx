'use client'

import { trpc } from '@/lib/trpc/react'
import Link from 'next/link'
import { Folder } from 'lucide-react'

export default function FoldersPage() {
  const { data: folders, isLoading } = trpc.folder.list.useQuery()

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    )
  }

  const rootFolders = folders?.filter((f) => !f.parentId) ?? []

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">All Folders</h1>
        <p className="mt-2 text-neutral-600">Organize your prompts with folders</p>
      </div>

      {rootFolders.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
          <h3 className="text-lg font-semibold text-neutral-900">No folders yet</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Create folders to organize your prompts
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rootFolders.map((folder) => (
            <Link
              key={folder.id}
              href={`/dashboard/folders/${folder.id}`}
              className="group rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <Folder className="h-6 w-6 text-primary-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                    {folder.name}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {folder.prompts.length} prompt{folder.prompts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
