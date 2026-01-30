import { PromptEditor } from '@/components/prompts/PromptEditor'

export default function NewPromptPage() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Create New Prompt</h1>
        <p className="mt-2 text-neutral-600">
          Add a new prompt to your collection
        </p>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6">
        <PromptEditor mode="create" />
      </div>
    </div>
  )
}
