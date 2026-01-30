'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/react'
import { Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function TeamList() {
  const { data: teams, isLoading, error } = trpc.team.list.useQuery()

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
        <p className="text-semantic-error">Failed to load teams: {error.message}</p>
      </div>
    )
  }

  if (!teams || teams.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">No teams yet</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Create a team to collaborate with others
        </p>
        <Link href="/dashboard/teams/new">
          <Button className="mt-4">Create Team</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {teams.map((team) => (
        <Link
          key={team.id}
          href={`/dashboard/teams/${team.id}`}
          className="group rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary-100 p-3">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600">
                {team.name}
              </h3>
              {team.description && (
                <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                  {team.description}
                </p>
              )}
              <p className="mt-2 text-sm text-neutral-500">
                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
