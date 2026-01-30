'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/react'
import { formatDate } from '@/lib/utils/format'
import {
  FileText,
  Edit,
  Eye,
  Share2,
  Copy,
  FolderOpen,
  Trash,
} from 'lucide-react'
import { ActivityType } from '@prisma/client'

interface ActivityFeedProps {
  limit?: number
  promptId?: string
}

export function ActivityFeed({ limit = 20, promptId }: ActivityFeedProps) {
  const { data: activities, isLoading, error } = promptId
    ? trpc.activity.getForPrompt.useQuery({ promptId, limit })
    : trpc.activity.getRecent.useQuery({ limit })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-neutral-100" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-semantic-error bg-semantic-error-light p-6">
        <p className="text-semantic-error">
          Failed to load activity: {error.message}
        </p>
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-neutral-900">No activity yet</h3>
        <p className="mt-2 text-sm text-neutral-600">
          {promptId
            ? 'Activity for this prompt will appear here'
            : 'Your activity will appear here as you create and edit prompts'}
        </p>
      </div>
    )
  }

  const getActivityIcon = (action: ActivityType) => {
    switch (action) {
      case 'CREATED':
        return <FileText className="h-5 w-5 text-semantic-success" />
      case 'UPDATED':
        return <Edit className="h-5 w-5 text-primary-600" />
      case 'VIEWED':
        return <Eye className="h-5 w-5 text-neutral-400" />
      case 'SHARED':
        return <Share2 className="h-5 w-5 text-primary-600" />
      case 'COPIED':
        return <Copy className="h-5 w-5 text-neutral-600" />
      case 'MOVED':
        return <FolderOpen className="h-5 w-5 text-neutral-600" />
      case 'DELETED':
        return <Trash className="h-5 w-5 text-semantic-error" />
      default:
        return <FileText className="h-5 w-5 text-neutral-400" />
    }
  }

  const getActivityText = (action: ActivityType, prompt: any) => {
    const promptTitle = prompt?.title || 'Unknown prompt'
    switch (action) {
      case 'CREATED':
        return (
          <>
            created{' '}
            {prompt && (
              <Link
                href={`/dashboard/prompts/${prompt.id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {promptTitle}
              </Link>
            )}
          </>
        )
      case 'UPDATED':
        return (
          <>
            updated{' '}
            {prompt && (
              <Link
                href={`/dashboard/prompts/${prompt.id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {promptTitle}
              </Link>
            )}
          </>
        )
      case 'VIEWED':
        return (
          <>
            viewed{' '}
            {prompt && (
              <Link
                href={`/dashboard/prompts/${prompt.id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {promptTitle}
              </Link>
            )}
          </>
        )
      case 'SHARED':
        return (
          <>
            shared{' '}
            {prompt && (
              <Link
                href={`/dashboard/prompts/${prompt.id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {promptTitle}
              </Link>
            )}
          </>
        )
      case 'COPIED':
        return (
          <>
            duplicated{' '}
            {prompt && (
              <Link
                href={`/dashboard/prompts/${prompt.id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {promptTitle}
              </Link>
            )}
          </>
        )
      case 'MOVED':
        return (
          <>
            moved{' '}
            {prompt && (
              <Link
                href={`/dashboard/prompts/${prompt.id}`}
                className="font-medium text-primary-600 hover:underline"
              >
                {promptTitle}
              </Link>
            )}
          </>
        )
      case 'DELETED':
        return <>deleted {promptTitle}</>
      default:
        return <>performed an action</>
    }
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-white p-4"
        >
          <div className="flex-shrink-0">{getActivityIcon(activity.action)}</div>
          <div className="flex-1">
            <p className="text-sm text-neutral-900">
              {'user' in activity && activity.user && (
                <span className="font-medium">
                  {activity.user.name ?? activity.user.email}
                </span>
              )}{' '}
              {getActivityText(activity.action, 'prompt' in activity ? activity.prompt : null)}
            </p>
            <p className="mt-1 text-xs text-neutral-500">
              {formatDate(activity.createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
