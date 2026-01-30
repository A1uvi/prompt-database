import { db } from '@/lib/db'
import type { Visibility } from '@prisma/client'

export type PermissionAction = 'view' | 'edit' | 'delete' | 'share'

interface CheckPermissionContext {
  userId: string
  promptId: string
  action: PermissionAction
}

export async function checkPromptPermission({
  userId,
  promptId,
  action,
}: CheckPermissionContext): Promise<boolean> {
  const prompt = await db.prompt.findUnique({
    where: { id: promptId },
    include: {
      owner: true,
      coCreators: {
        select: { userId: true },
      },
      teamAccess: {
        include: {
          team: {
            include: {
              members: {
                select: { userId: true },
              },
            },
          },
        },
      },
    },
  })

  // Prompt doesn't exist or is soft deleted
  if (!prompt || prompt.deletedAt) {
    return false
  }

  // 1. Owner has full access
  if (prompt.ownerId === userId) {
    return true
  }

  // 2. Co-creators can view, edit, and share (but not delete or change visibility)
  const isCoCreator = prompt.coCreators.some((cc) => cc.userId === userId)
  if (isCoCreator && action !== 'delete') {
    return true
  }

  // 3. Public prompts are viewable by anyone
  if (prompt.visibility === 'PUBLIC' && action === 'view') {
    return true
  }

  // 4. Team members can view prompts shared with their team
  if (prompt.visibility === 'TEAM' && action === 'view') {
    const hasTeamAccess = prompt.teamAccess.some((ta) =>
      ta.team.members.some((m) => m.userId === userId)
    )
    if (hasTeamAccess) {
      return true
    }
  }

  return false
}

export async function canUserAccessFolder(
  userId: string,
  folderId: string
): Promise<boolean> {
  const folder = await db.folder.findUnique({
    where: { id: folderId },
    select: { ownerId: true },
  })

  if (!folder) return false
  return folder.ownerId === userId
}

export async function canUserAccessTeam(
  userId: string,
  teamId: string
): Promise<boolean> {
  const membership = await db.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  })

  return !!membership
}

export async function isTeamAdmin(
  userId: string,
  teamId: string
): Promise<boolean> {
  const membership = await db.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    select: { role: true },
  })

  return membership?.role === 'ADMIN'
}
