import { z } from 'zod'
import { router, protectedProcedure } from '@/lib/trpc/server'
import { isTeamAdmin } from '@/lib/permissions/check'
import { TRPCError } from '@trpc/server'
import { TeamRole } from '@prisma/client'

export const teamRouter = router({
  // Create team
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const team = await db.team.create({
        data: {
          name: input.name,
          description: input.description,
          creatorId: userId,
          members: {
            create: {
              userId,
              role: 'ADMIN',
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
        },
      })

      return team
    }),

  // Update team
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

      const admin = await isTeamAdmin(userId, id)
      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const updated = await db.team.update({
        where: { id },
        data,
      })

      return updated
    }),

  // Delete team
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const team = await db.team.findUnique({
        where: { id: input.id },
        select: { creatorId: true },
      })

      if (!team || team.creatorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Prompts shared only with this team become private
      const sharedPrompts = await db.prompt.findMany({
        where: {
          visibility: 'TEAM',
          teamAccess: {
            some: { teamId: input.id },
          },
        },
        include: {
          teamAccess: true,
        },
      })

      // For each prompt, check if it's only shared with this team
      for (const prompt of sharedPrompts) {
        if (prompt.teamAccess.length === 1) {
          // Only shared with this team, make it private
          await db.prompt.update({
            where: { id: prompt.id },
            data: { visibility: 'PRIVATE' },
          })
        }
      }

      await db.team.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // List user's teams
  list: protectedProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx

    const teams = await db.team.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return teams
  }),

  // Get team details
  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const team = await db.team.findUnique({
        where: { id: input.id },
        include: {
          creator: {
            select: { id: true, name: true, email: true, image: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, image: true },
              },
            },
          },
        },
      })

      if (!team) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Check if user is a member
      const isMember = team.members.some((m) => m.userId === userId)
      if (!isMember) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return team
    }),

  // Add member
  addMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(TeamRole).default('MEMBER'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const admin = await isTeamAdmin(userId, input.teamId)
      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Check if user exists
      const user = await db.user.findUnique({
        where: { id: input.userId },
      })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      // Check if already a member
      const existing = await db.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      })

      if (existing) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User is already a member',
        })
      }

      const member = await db.teamMember.create({
        data: {
          teamId: input.teamId,
          userId: input.userId,
          role: input.role,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })

      return member
    }),

  // Remove member
  removeMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const admin = await isTeamAdmin(userId, input.teamId)
      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Can't remove the creator
      const team = await db.team.findUnique({
        where: { id: input.teamId },
        select: { creatorId: true },
      })

      if (team?.creatorId === input.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot remove team creator',
        })
      }

      await db.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
      })

      return { success: true }
    }),

  // Update member role
  updateMemberRole: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        userId: z.string(),
        role: z.nativeEnum(TeamRole),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx

      const admin = await isTeamAdmin(userId, input.teamId)
      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      // Can't change creator's role
      const team = await db.team.findUnique({
        where: { id: input.teamId },
        select: { creatorId: true },
      })

      if (team?.creatorId === input.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot change team creator role',
        })
      }

      const updated = await db.teamMember.update({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId: input.userId,
          },
        },
        data: { role: input.role },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      })

      return updated
    }),

  // List team members
  listMembers: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx

      // Check if user is a member
      const membership = await db.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: input.teamId,
            userId,
          },
        },
      })

      if (!membership) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      const members = await db.teamMember.findMany({
        where: { teamId: input.teamId },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
        orderBy: { joinedAt: 'asc' },
      })

      return members
    }),
})
