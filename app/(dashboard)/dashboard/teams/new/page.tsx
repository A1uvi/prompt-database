'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function NewTeamPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = trpc.team.create.useMutation({
    onSuccess: (data) => {
      router.push(`/dashboard/teams/${data.id}`)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      name,
      description: description || undefined,
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Create New Team</h1>
        <p className="mt-2 text-neutral-600">
          Set up a team to collaborate with others
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {createMutation.error && (
            <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-4">
              <p className="text-sm text-semantic-error">
                {createMutation.error.message}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Team Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your team (optional)"
              rows={4}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Team'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
