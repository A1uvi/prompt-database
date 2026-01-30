import { PromptList } from '@/components/prompts/PromptList'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Recent Prompts</h1>
        <p className="mt-2 text-neutral-600">
          Your recently created and edited prompts
        </p>
      </div>

      <PromptList />
    </div>
  )
}
