import { router } from '@/lib/trpc/server'
import { promptRouter } from './prompt'
import { folderRouter } from './folder'
import { teamRouter } from './team'
import { activityRouter } from './activity'

export const appRouter = router({
  prompt: promptRouter,
  folder: folderRouter,
  team: teamRouter,
  activity: activityRouter,
})

export type AppRouter = typeof appRouter
