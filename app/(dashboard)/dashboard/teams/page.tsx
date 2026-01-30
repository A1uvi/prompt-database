import Link from 'next/link'
import { TeamList } from '@/components/teams/TeamList'
import { Button } from '@/components/ui/button'

export default function TeamsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Teams</h1>
          <p className="mt-2 text-neutral-600">
            Collaborate and share prompts with your teams
          </p>
        </div>
        <Link href="/dashboard/teams/new">
          <Button>Create Team</Button>
        </Link>
      </div>

      <TeamList />
    </div>
  )
}
