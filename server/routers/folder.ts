import { z } from 'zod'
import { router, protectedProcedure } from '@/lib/trpc/server'
import { TRPCError } from '@trpc/server'

export const folderRouter = router({
  // Create folder
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      // If parentId provided, verify user owns parent
      if (input.parentId) {
        const parent = await db.folder.findUnique({
          where: { id: input.parentId },
          select: { ownerId: true },
        })

        if (!parent || parent.ownerId !== userId) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
      }

      const folder = await db.folder.create({
        data: {
          name: input.name,
          description: input.description,
          ownerId: userId,
          parentId: input.parentId,
        },
      })

      return folder
    }),

  // Update folder
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx
      const { id, ...data } = input

      const folder = await db.folder.findUnique({
        where: { id },
        select: { ownerId: true },
      })

      if (!folder || folder.ownerId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const updated = await db.folder.update({
        where: { id },
        data,
      })

      return updated
    }),

  // Delete folder (must be empty)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const folder = await db.folder.findUnique({
        where: { id: input.id },
        include: {
          prompts: true,
          children: true,
        },
      })

      if (!folder || folder.ownerId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Check if folder has prompts or child folders
      if (folder.prompts.length > 0 || folder.children.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Cannot delete folder. It contains ${folder.prompts.length} prompts and ${folder.children.length} subfolders.`,
        })
      }

      await db.folder.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Get folder with prompts
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const folder = await db.folder.findUnique({
        where: { id: input.id },
        include: {
          prompts: {
            where: { deletedAt: null },
            include: {
              owner: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
            orderBy: { updatedAt: 'desc' },
          },
          children: {
            orderBy: { name: 'asc' },
          },
        },
      })

      if (!folder || folder.ownerId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return folder
    }),

  // List user's folders (tree structure)
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx

    const folders = await db.folder.findMany({
      where: { ownerId: userId },
      include: {
        children: {
          orderBy: { name: 'asc' },
        },
        prompts: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return folders
  }),

  // Move folder in hierarchy
  move: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        newParentId: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const folder = await db.folder.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      })

      if (!folder || folder.ownerId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // If moving to a parent, verify user owns parent
      if (input.newParentId) {
        const parent = await db.folder.findUnique({
          where: { id: input.newParentId },
          select: { ownerId: true },
        })

        if (!parent || parent.ownerId !== userId) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }

        // Check for circular reference (can't move folder into itself or its children)
        const isDescendant = await checkIfDescendant(
          db,
          input.newParentId,
          input.id
        )
        if (isDescendant || input.newParentId === input.id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot move folder into itself or its descendants',
          })
        }
      }

      const updated = await db.folder.update({
        where: { id: input.id },
        data: { parentId: input.newParentId },
      })

      return updated
    }),
})

// Helper function to check if a folder is a descendant of another
async function checkIfDescendant(
  db: any,
  folderId: string,
  ancestorId: string
): Promise<boolean> {
  const folder = await db.folder.findUnique({
    where: { id: folderId },
    select: { parentId: true },
  })

  if (!folder || !folder.parentId) return false
  if (folder.parentId === ancestorId) return true

  return checkIfDescendant(db, folder.parentId, ancestorId)
}
