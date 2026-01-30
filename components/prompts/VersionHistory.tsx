'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils/format'
import { History, RotateCcw } from 'lucide-react'

interface VersionHistoryProps {
  promptId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VersionHistory({
  promptId,
  open,
  onOpenChange,
}: VersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)

  const utils = trpc.useUtils()
  const { data: versions, isLoading } = trpc.prompt.getVersions.useQuery(
    { id: promptId },
    { enabled: open }
  )

  const restoreMutation = trpc.prompt.restoreVersion.useMutation({
    onSuccess: () => {
      utils.prompt.get.invalidate({ id: promptId })
      utils.prompt.getVersions.invalidate({ id: promptId })
      onOpenChange(false)
      setShowRestoreConfirm(false)
      setSelectedVersion(null)
    },
  })

  const handleRestore = () => {
    if (selectedVersion !== null) {
      restoreMutation.mutate({
        id: promptId,
        version: selectedVersion,
      })
    }
  }

  const selectedVersionData = versions?.find((v) => v.version === selectedVersion)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and restore previous versions of this prompt
            </DialogDescription>
          </DialogHeader>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-neutral-100" />
              ))}
            </div>
          )}

          {versions && versions.length === 0 && (
            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center">
              <History className="mx-auto h-12 w-12 text-neutral-400" />
              <p className="mt-4 text-neutral-600">No version history yet</p>
              <p className="mt-2 text-sm text-neutral-500">
                Versions are created when you edit the prompt
              </p>
            </div>
          )}

          {versions && versions.length > 0 && (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    selectedVersion === version.version
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  } cursor-pointer`}
                  onClick={() => setSelectedVersion(version.version)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700">
                          Version {version.version}
                        </span>
                        <span className="text-sm text-neutral-600">
                          {formatDateTime(version.createdAt)}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-neutral-900">
                        {version.title}
                      </h3>
                      {selectedVersion === version.version && (
                        <div className="mt-3 rounded-md bg-neutral-50 p-3">
                          <p className="text-sm text-neutral-700">
                            {version.content.length > 300
                              ? version.content.slice(0, 300) + '...'
                              : version.content}
                          </p>
                          {version.tags && version.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {version.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-neutral-200 px-2 py-0.5 text-xs text-neutral-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {selectedVersion === version.version && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowRestoreConfirm(true)
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Restore confirmation dialog */}
      <Dialog open={showRestoreConfirm} onOpenChange={setShowRestoreConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version {selectedVersion}?</DialogTitle>
            <DialogDescription>
              This will create a new version with the content from version{' '}
              {selectedVersion}. Your current version will be preserved in the
              history.
            </DialogDescription>
          </DialogHeader>
          {selectedVersionData && (
            <div className="rounded-md bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-900">
                {selectedVersionData.title}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Created {formatDateTime(selectedVersionData.createdAt)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowRestoreConfirm(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRestore}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? 'Restoring...' : 'Restore Version'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
