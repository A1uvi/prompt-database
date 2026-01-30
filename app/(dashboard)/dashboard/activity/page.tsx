import { ActivityFeed } from '@/components/activity/ActivityFeed'

export default function ActivityPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Recent Activity</h1>
        <p className="mt-2 text-neutral-600">
          Track your actions and changes across all prompts
        </p>
      </div>

      <ActivityFeed limit={50} />
    </div>
  )
}
