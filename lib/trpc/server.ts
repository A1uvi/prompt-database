import { initTRPC, TRPCError } from '@trpc/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import superjson from 'superjson'

export const createContext = async () => {
  const session = await auth()
  return {
    session,
    db,
    userId: session?.user?.id,
  }
}

const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async (opts) => {
  const { ctx } = opts
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return opts.next({
    ctx: {
      ...ctx,
      session: ctx.session,
      userId: ctx.userId,
    },
  })
})
