import type { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

// Edge-compatible config for middleware (no providers that require Node.js APIs)
export const authConfigEdge = {
  providers: [], // Providers are only needed in API routes, not middleware
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async authorized({ auth }) {
      return !!auth
    },
  },
  basePath: '/api/auth',
  session: {
    strategy: 'jwt' as const,
  },
} satisfies NextAuthConfig

// Validation schema for credentials
const credentialsSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// Full config for API routes (includes providers that require Node.js runtime)
export const authConfig: NextAuthConfig = {
  ...authConfigEdge,
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { username, password } = credentialsSchema.parse(credentials)

          // Find user by username
          const user = await db.user.findUnique({
            where: { username },
            select: {
              id: true,
              username: true,
              password: true,
              name: true,
              email: true,
              image: true,
            },
          })

          if (!user) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(password, user.password)

          if (!isValidPassword) {
            return null
          }

          // Return user without password
          return {
            id: user.id,
            username: user.username,
            name: user.name,
            email: user.email,
            image: user.image,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add user data to token on sign in
      if (user) {
        token.id = user.id
        // @ts-expect-error - username exists on user from authorize
        token.username = user.username
        token.name = user.name
        token.email = user.email
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      // Add token data to session
      if (session.user) {
        session.user.id = token.id as string
        // @ts-expect-error - username will be added to session type
        session.user.username = token.username as string
        session.user.name = token.name as string | null
        session.user.email = token.email as string | null
        session.user.image = token.picture as string | null
      }
      return session
    },
    async authorized({ auth }) {
      return !!auth
    },
  },
}
