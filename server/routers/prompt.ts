import { z } from 'zod'
import { router, protectedProcedure } from '@/lib/trpc/server'
import { checkPromptPermission } from '@/lib/permissions/check'
import { TRPCError } from '@trpc/server'
import { PromptType, Visibility } from '@prisma/client'

const createPromptSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  contentUrl: z.string().url().optional(),
  usageNotes: z.string().optional(),
  contentType: z.nativeEnum(PromptType).default('PROMPT'),
  variables: z.array(z.object({ name: z.string(), description: z.string() })).optional(),
  exampleIO: z.array(z.object({ input: z.string(), output: z.string() })).optional(),
  tags: z.array(z.string()).optional(),
  customSections: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  folderId: z.string().optional(),
  visibility: z.nativeEnum(Visibility).default('PRIVATE'),
})

const updatePromptSchema = createPromptSchema.partial().extend({
  id: z.string(),
})

export const promptRouter = router({
  // Create new prompt
  create: protectedProcedure
    .input(createPromptSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const prompt = await db.prompt.create({
        data: {
          ...input,
          ownerId: userId,
          variables: input.variables ?? undefined,
          exampleIO: input.exampleIO ?? undefined,
          tags: input.tags ?? [],
          customSections: input.customSections ?? undefined,
          metadata: input.metadata ?? undefined,
        },
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: prompt.id,
          action: 'CREATED',
        },
      })

      return prompt
    }),

  // Update prompt (creates new version)
  update: protectedProcedure
    .input(updatePromptSchema)
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx
      const { id, ...data } = input

      const canEdit = await checkPromptPermission({
        userId,
        promptId: id,
        action: 'edit',
      })

      if (!canEdit) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const currentPrompt = await db.prompt.findUnique({ where: { id } })
      if (!currentPrompt) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Create version before updating
      const latestVersion = await db.promptVersion.findFirst({
        where: { promptId: id },
        orderBy: { version: 'desc' },
      })

      await db.promptVersion.create({
        data: {
          promptId: id,
          version: (latestVersion?.version ?? 0) + 1,
          title: currentPrompt.title,
          content: currentPrompt.content,
          contentUrl: currentPrompt.contentUrl,
          usageNotes: currentPrompt.usageNotes,
          variables: currentPrompt.variables ?? undefined,
          exampleIO: currentPrompt.exampleIO ?? undefined,
          tags: currentPrompt.tags,
          customSections: currentPrompt.customSections ?? undefined,
          metadata: currentPrompt.metadata ?? undefined,
          createdBy: userId,
        },
      })

      // Update prompt
      const updated = await db.prompt.update({
        where: { id },
        data: {
          ...data,
          variables: data.variables ?? undefined,
          exampleIO: data.exampleIO ?? undefined,
          tags: data.tags ?? undefined,
          customSections: data.customSections ?? undefined,
          metadata: data.metadata ?? undefined,
        },
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: id,
          action: 'UPDATED',
        },
      })

      return updated
    }),

  // Soft delete prompt
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canDelete = await checkPromptPermission({
        userId,
        promptId: input.id,
        action: 'delete',
      })

      if (!canDelete) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await db.prompt.update({
        where: { id: input.id },
        data: { deletedAt: new Date() },
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: input.id,
          action: 'DELETED',
        },
      })

      return { success: true }
    }),

  // Get single prompt
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canView = await checkPromptPermission({
        userId,
        promptId: input.id,
        action: 'view',
      })

      if (!canView) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const prompt = await db.prompt.findUnique({
        where: { id: input.id },
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          folder: { select: { id: true, name: true } },
          coCreators: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
          teamAccess: {
            include: {
              team: { select: { id: true, name: true } },
            },
          },
        },
      })

      if (!prompt || prompt.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Log view activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: input.id,
          action: 'VIEWED',
        },
      })

      return prompt
    }),

  // List prompts with filters
  list: protectedProcedure
    .input(
      z.object({
        folderId: z.string().optional(),
        contentType: z.nativeEnum(PromptType).optional(),
        visibility: z.nativeEnum(Visibility).optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx
      const { limit, cursor, ...filters } = input

      const prompts = await db.prompt.findMany({
        where: {
          deletedAt: null,
          ...(filters.folderId !== undefined && { folderId: filters.folderId }),
          ...(filters.contentType && { contentType: filters.contentType }),
          ...(filters.visibility && { visibility: filters.visibility }),
          ...(filters.tags && filters.tags.length > 0 && {
            tags: { hasSome: filters.tags },
          }),
          OR: [
            { ownerId: userId },
            { coCreators: { some: { userId } } },
            { visibility: 'PUBLIC' },
            {
              visibility: 'TEAM',
              teamAccess: {
                some: {
                  team: {
                    members: {
                      some: { userId },
                    },
                  },
                },
              },
            },
          ],
        },
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          folder: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      })

      let nextCursor: string | undefined = undefined
      if (prompts.length > limit) {
        const nextItem = prompts.pop()
        nextCursor = nextItem!.id
      }

      return {
        items: prompts,
        nextCursor,
      }
    }),

  // Search prompts (basic full-text search)
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        contentType: z.nativeEnum(PromptType).optional(),
        tags: z.array(z.string()).optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const prompts = await db.prompt.findMany({
        where: {
          deletedAt: null,
          ...(input.contentType && { contentType: input.contentType }),
          ...(input.tags && input.tags.length > 0 && {
            tags: { hasSome: input.tags },
          }),
          OR: [
            { ownerId: userId },
            { coCreators: { some: { userId } } },
            { visibility: 'PUBLIC' },
            {
              visibility: 'TEAM',
              teamAccess: {
                some: {
                  team: {
                    members: {
                      some: { userId },
                    },
                  },
                },
              },
            },
          ],
          AND: [
            {
              OR: [
                { title: { contains: input.query, mode: 'insensitive' } },
                { content: { contains: input.query, mode: 'insensitive' } },
                { usageNotes: { contains: input.query, mode: 'insensitive' } },
                { tags: { has: input.query } },
              ],
            },
          ],
        },
        include: {
          owner: { select: { id: true, name: true, email: true, image: true } },
          folder: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: input.limit,
      })

      return prompts
    }),

  // Duplicate prompt
  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canView = await checkPromptPermission({
        userId,
        promptId: input.id,
        action: 'view',
      })

      if (!canView) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const original = await db.prompt.findUnique({
        where: { id: input.id },
      })

      if (!original || original.deletedAt) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const duplicate = await db.prompt.create({
        data: {
          title: `${original.title} (Copy)`,
          content: original.content,
          contentUrl: original.contentUrl,
          usageNotes: original.usageNotes,
          contentType: original.contentType,
          variables: original.variables ?? undefined,
          exampleIO: original.exampleIO ?? undefined,
          tags: original.tags,
          customSections: original.customSections ?? undefined,
          metadata: original.metadata ?? undefined,
          ownerId: userId,
          visibility: 'PRIVATE',
        },
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: duplicate.id,
          action: 'COPIED',
          metadata: { originalId: original.id },
        },
      })

      return duplicate
    }),

  // Move prompt to folder
  move: protectedProcedure
    .input(z.object({ id: z.string(), folderId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canEdit = await checkPromptPermission({
        userId,
        promptId: input.id,
        action: 'edit',
      })

      if (!canEdit) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const updated = await db.prompt.update({
        where: { id: input.id },
        data: { folderId: input.folderId },
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: input.id,
          action: 'MOVED',
          metadata: { folderId: input.folderId },
        },
      })

      return updated
    }),

  // Add co-creator
  addCoCreator: protectedProcedure
    .input(z.object({ promptId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canShare = await checkPromptPermission({
        userId,
        promptId: input.promptId,
        action: 'share',
      })

      if (!canShare) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const coCreator = await db.promptCoCreator.create({
        data: {
          promptId: input.promptId,
          userId: input.userId,
        },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: input.promptId,
          action: 'SHARED',
          metadata: { coCreatorId: input.userId },
        },
      })

      return coCreator
    }),

  // Remove co-creator
  removeCoCreator: protectedProcedure
    .input(z.object({ promptId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canShare = await checkPromptPermission({
        userId,
        promptId: input.promptId,
        action: 'share',
      })

      if (!canShare) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await db.promptCoCreator.delete({
        where: {
          promptId_userId: {
            promptId: input.promptId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),

  // Update visibility
  updateVisibility: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        visibility: z.nativeEnum(Visibility),
        teamIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      // Only owner can change visibility
      const prompt = await db.prompt.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      })

      if (!prompt || prompt.ownerId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Update visibility
      const updated = await db.prompt.update({
        where: { id: input.id },
        data: { visibility: input.visibility },
      })

      // If team visibility, update team access
      if (input.visibility === 'TEAM' && input.teamIds) {
        // Remove existing team access
        await db.promptTeamAccess.deleteMany({
          where: { promptId: input.id },
        })

        // Add new team access
        await db.promptTeamAccess.createMany({
          data: input.teamIds.map((teamId) => ({
            promptId: input.id,
            teamId,
          })),
        })
      } else if (input.visibility !== 'TEAM') {
        // Remove all team access if not team visibility
        await db.promptTeamAccess.deleteMany({
          where: { promptId: input.id },
        })
      }

      return updated
    }),

  // Get version history
  getVersions: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canView = await checkPromptPermission({
        userId,
        promptId: input.id,
        action: 'view',
      })

      if (!canView) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const versions = await db.promptVersion.findMany({
        where: { promptId: input.id },
        orderBy: { version: 'desc' },
      })

      return versions
    }),

  // Restore version
  restoreVersion: protectedProcedure
    .input(z.object({ id: z.string(), version: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const canEdit = await checkPromptPermission({
        userId,
        promptId: input.id,
        action: 'edit',
      })

      if (!canEdit) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const version = await db.promptVersion.findUnique({
        where: {
          promptId_version: {
            promptId: input.id,
            version: input.version,
          },
        },
      })

      if (!version) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      const currentPrompt = await db.prompt.findUnique({
        where: { id: input.id },
      })

      if (!currentPrompt) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Create version for current state before restoring
      const latestVersion = await db.promptVersion.findFirst({
        where: { promptId: input.id },
        orderBy: { version: 'desc' },
      })

      await db.promptVersion.create({
        data: {
          promptId: input.id,
          version: (latestVersion?.version ?? 0) + 1,
          title: currentPrompt.title,
          content: currentPrompt.content,
          contentUrl: currentPrompt.contentUrl,
          usageNotes: currentPrompt.usageNotes,
          variables: currentPrompt.variables ?? undefined,
          exampleIO: currentPrompt.exampleIO ?? undefined,
          tags: currentPrompt.tags,
          customSections: currentPrompt.customSections ?? undefined,
          metadata: currentPrompt.metadata ?? undefined,
          createdBy: userId,
        },
      })

      // Restore from version
      const restored = await db.prompt.update({
        where: { id: input.id },
        data: {
          title: version.title,
          content: version.content,
          contentUrl: version.contentUrl,
          usageNotes: version.usageNotes,
          variables: version.variables ?? undefined,
          exampleIO: version.exampleIO ?? undefined,
          tags: version.tags,
          customSections: version.customSections ?? undefined,
          metadata: version.metadata ?? undefined,
        },
      })

      // Log activity
      await db.activityLog.create({
        data: {
          userId,
          promptId: input.id,
          action: 'UPDATED',
          metadata: { restoredFromVersion: input.version },
        },
      })

      return restored
    }),
})
