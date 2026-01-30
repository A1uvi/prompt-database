import { z } from 'zod'
import { router, protectedProcedure } from '@/lib/trpc/server'
import { ActivityType } from '@prisma/client'

export const activityRouter = router({
  // Log activity
  log: protectedProcedure
    .input(
      z.object({
        action: z.nativeEnum(ActivityType),
        promptId: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const activity = await db.activityLog.create({
        data: {
          userId,
          action: input.action,
          promptId: input.promptId,
          metadata: input.metadata ?? undefined,
        },
      })

      return activity
    }),

  // Get recent user activity
  getRecent: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const activities = await db.activityLog.findMany({
        where: { userId },
        include: {
          prompt: {
            select: {
              id: true,
              title: true,
              contentType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })

      return activities
    }),

  // Get activity for specific prompt
  getForPrompt: protectedProcedure
    .input(
      z.object({
        promptId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const activities = await db.activityLog.findMany({
        where: { promptId: input.promptId },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: input.limit,
      })

      return activities
    }),
})
