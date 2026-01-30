'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash, UserPlus } from 'lucide-react'
import { formatDateTime } from '@/lib/utils/format'

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [showAddMemberDialog, setShowAddMemberDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')

  const utils = trpc.useUtils()
  const { data: team, isLoading, error } = trpc.team.get.useQuery({ id })

  const addMemberMutation = trpc.team.addMember.useMutation({
    onSuccess: () => {
      utils.team.get.invalidate({ id })
      setShowAddMemberDialog(false)
      setMemberEmail('')
    },
  })

  const removeMemberMutation = trpc.team.removeMember.useMutation({
    onSuccess: () => {
      utils.team.get.invalidate({ id })
    },
  })

  const deleteMutation = trpc.team.delete.useMutation({
    onSuccess: () => {
      router.push('/dashboard/teams')
    },
  })

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!memberEmail.trim()) return

    // In a real app, you'd look up the user by email first
    // For now, we'll just show an error
    addMemberMutation.mutate({
      teamId: id,
      userId: memberEmail, // This would be the actual user ID
      role: 'MEMBER',
    })
  }

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate({
      teamId: id,
      userId,
    })
  }

  const handleDelete = () => {
    deleteMutation.mutate({ id })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-100" />
        <div className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
          <p className="text-semantic-error">Failed to load team: {error.message}</p>
        </div>
      </div>
    )
  }

  if (!team) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-neutral-600">Team not found</p>
        </div>
      </div>
    )
  }

  const isCreator = team.creator.id === team.members[0]?.userId // Simplified check

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">{team.name}</h1>
          {team.description && (
            <p className="mt-2 text-neutral-600">{team.description}</p>
          )}
          <p className="mt-2 text-sm text-neutral-500">
            Created by {team.creator.name ?? team.creator.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddMemberDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
          {isCreator && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-semantic-error"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-neutral-900">
          Members ({team.members.length})
        </h2>
        <div className="space-y-3">
          {team.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex items-center gap-3">
                {member.user.image ? (
                  <img
                    src={member.user.image}
                    alt={member.user.name ?? 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700">
                    {member.user.name?.charAt(0) ?? member.user.email?.charAt(0) ?? 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-neutral-900">
                    {member.user.name ?? member.user.email}
                  </p>
                  {member.user.name && (
                    <p className="text-sm text-neutral-500">{member.user.email}</p>
                  )}
                  <p className="text-xs text-neutral-400">
                    {member.role} • Joined {formatDateTime(member.joinedAt)}
                  </p>
                </div>
              </div>
              {isCreator && member.role !== 'ADMIN' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId)}
                  disabled={removeMemberMutation.isPending}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMemberDialog} onOpenChange={setShowAddMemberDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to add to this team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            {addMemberMutation.error && (
              <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-3">
                <p className="text-sm text-semantic-error">
                  {addMemberMutation.error.message}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="memberEmail">Email Address</Label>
              <Input
                id="memberEmail"
                type="email"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="member@example.com"
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddMemberDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addMemberMutation.isPending}>
                {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Team Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this team? This action cannot be undone.
              All prompts shared with this team will become private.
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
              {deleteMutation.isPending ? 'Deleting...' : 'Delete Team'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
