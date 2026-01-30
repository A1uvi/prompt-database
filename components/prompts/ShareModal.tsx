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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Visibility } from '@prisma/client'
import { Copy, Check, X } from 'lucide-react'

interface ShareModalProps {
  promptId: string
  currentVisibility: Visibility
  coCreators: Array<{
    id: string
    userId: string
    user: {
      id: string
      name: string | null
      email: string | null
      image: string | null
    }
  }>
  teamAccess: Array<{
    id: string
    teamId: string
    team: {
      id: string
      name: string
    }
  }>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareModal({
  promptId,
  currentVisibility,
  coCreators,
  teamAccess,
  open,
  onOpenChange,
}: ShareModalProps) {
  const [visibility, setVisibility] = useState<Visibility>(currentVisibility)
  const [selectedTeams, setSelectedTeams] = useState<string[]>(
    teamAccess.map((ta) => ta.teamId)
  )
  const [coCreatorEmail, setCoCreatorEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const utils = trpc.useUtils()
  const { data: teams } = trpc.team.list.useQuery()

  const updateVisibilityMutation = trpc.prompt.updateVisibility.useMutation({
    onSuccess: () => {
      utils.prompt.get.invalidate({ id: promptId })
    },
  })

  const addCoCreatorMutation = trpc.prompt.addCoCreator.useMutation({
    onSuccess: () => {
      utils.prompt.get.invalidate({ id: promptId })
      setCoCreatorEmail('')
    },
  })

  const removeCoCreatorMutation = trpc.prompt.removeCoCreator.useMutation({
    onSuccess: () => {
      utils.prompt.get.invalidate({ id: promptId })
    },
  })

  const handleSave = () => {
    updateVisibilityMutation.mutate({
      id: promptId,
      visibility,
      teamIds: visibility === 'TEAM' ? selectedTeams : undefined,
    })
  }

  const handleAddCoCreator = (e: React.FormEvent) => {
    e.preventDefault()
    if (!coCreatorEmail.trim()) return

    // In a real app, you'd look up user by email first
    // For now, we'll show a placeholder error
    addCoCreatorMutation.mutate({
      promptId,
      userId: coCreatorEmail, // This would be the actual user ID
    })
  }

  const handleRemoveCoCreator = (userId: string) => {
    removeCoCreatorMutation.mutate({
      promptId,
      userId,
    })
  }

  const handleToggleTeam = (teamId: string) => {
    setSelectedTeams((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    )
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/dashboard/prompts/${promptId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Prompt</DialogTitle>
          <DialogDescription>
            Control who can view and edit this prompt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visibility Settings */}
          <div className="space-y-3">
            <Label>Visibility</Label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-4 cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === 'PRIVATE'}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-neutral-900">Private</p>
                  <p className="text-sm text-neutral-600">
                    Only you and co-creators can access
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-4 cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === 'PUBLIC'}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-neutral-900">Public</p>
                  <p className="text-sm text-neutral-600">
                    Anyone with the link can view
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-md border border-neutral-200 p-4 cursor-pointer hover:bg-neutral-50">
                <input
                  type="radio"
                  name="visibility"
                  value="TEAM"
                  checked={visibility === 'TEAM'}
                  onChange={(e) => setVisibility(e.target.value as Visibility)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-neutral-900">Team</p>
                  <p className="text-sm text-neutral-600">
                    Share with specific teams
                  </p>
                  {visibility === 'TEAM' && teams && teams.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {teams.map((team) => (
                        <label
                          key={team.id}
                          className="flex items-center gap-2 rounded-md bg-neutral-50 p-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTeams.includes(team.id)}
                            onChange={() => handleToggleTeam(team.id)}
                          />
                          <span className="text-sm text-neutral-700">
                            {team.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {visibility === 'TEAM' && (!teams || teams.length === 0) && (
                    <p className="mt-2 text-sm text-neutral-500">
                      No teams available. Create a team first.
                    </p>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Co-creators */}
          <div className="space-y-3">
            <Label>Co-creators (Can Edit)</Label>
            <form onSubmit={handleAddCoCreator} className="flex gap-2">
              <Input
                type="email"
                value={coCreatorEmail}
                onChange={(e) => setCoCreatorEmail(e.target.value)}
                placeholder="Add by email"
              />
              <Button type="submit" disabled={addCoCreatorMutation.isPending}>
                Add
              </Button>
            </form>

            {addCoCreatorMutation.error && (
              <p className="text-sm text-semantic-error">
                {addCoCreatorMutation.error.message}
              </p>
            )}

            {coCreators.length > 0 && (
              <div className="space-y-2">
                {coCreators.map((coCreator) => (
                  <div
                    key={coCreator.id}
                    className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {coCreator.user.image ? (
                        <img
                          src={coCreator.user.image}
                          alt={coCreator.user.name ?? 'User'}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                          {coCreator.user.name?.charAt(0) ??
                            coCreator.user.email?.charAt(0) ??
                            'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {coCreator.user.name ?? coCreator.user.email}
                        </p>
                        {coCreator.user.name && (
                          <p className="text-xs text-neutral-500">
                            {coCreator.user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoCreator(coCreator.userId)}
                      disabled={removeCoCreatorMutation.isPending}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/dashboard/prompts/${promptId}`}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateVisibilityMutation.isPending}
            >
              {updateVisibilityMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
