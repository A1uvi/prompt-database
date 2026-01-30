import NextAuth from 'next-auth'
import { authConfigEdge } from './config'

// Edge-compatible auth for use in middleware
export const { auth } = NextAuth(authConfigEdge)
