import Link from 'next/link'
import { formatDate } from '@/lib/utils/format'
import { PromptType } from '@prisma/client'

interface PromptCardProps {
  prompt: {
    id: string
    title: string
    content: string
    contentType: PromptType
    updatedAt: Date
    owner: {
      name: string | null
      email: string | null
    }
  }
}

export function PromptCard({ prompt }: PromptCardProps) {
  const contentPreview = prompt.content.slice(0, 150) + '...'

  return (
    <Link href={`/dashboard/prompts/${prompt.id}`}>
      <div className="rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-neutral-900">
            {prompt.title}
          </h3>
          <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
            {prompt.contentType}
          </span>
        </div>

        <p className="mt-2 text-sm text-neutral-600">{contentPreview}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {formatDate(prompt.updatedAt)}
          </span>
          <span className="text-xs text-neutral-500">
            by {prompt.owner.name ?? prompt.owner.email}
          </span>
        </div>
      </div>
    </Link>
  )
}
