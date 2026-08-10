import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials, request) => {
        const email = String(credentials.email)
        const password = String(credentials.password)

        if (!email || !password) return null

        // Rate limit: 5 login attempts per minute per IP
        const ip = getClientIP(request as unknown as Request)
        const rl = checkRateLimit(`login:${ip}`, 5, 60_000)
        if (!rl.allowed) {
          // Log rate-limited attempt
          prisma.auditLog.create({
            data: {
              action: 'auth.login_rate_limited',
              entityType: 'user',
              entityId: email,
              actorEmail: email,
              details: JSON.stringify({ ip }),
            },
          }).catch(() => {})
          return null
        }

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) {
          // Log failed attempt — user not found
          prisma.auditLog.create({
            data: {
              action: 'auth.login_failed',
              entityType: 'user',
              entityId: email,
              actorEmail: email,
              details: JSON.stringify({ reason: 'user_not_found', ip }),
            },
          }).catch(() => {})
          return null
        }

        // Account lockout: check failed attempts in last 15 minutes
        const LOCKOUT_WINDOW_MS = 15 * 60 * 1000
        const LOCKOUT_MAX_ATTEMPTS = 5
        const lockoutThreshold = new Date(Date.now() - LOCKOUT_WINDOW_MS)
        const recentFailures = await prisma.auditLog.count({
          where: {
            action: 'auth.login_failed',
            entityId: email,
            createdAt: { gte: lockoutThreshold },
          },
        })

        if (recentFailures >= LOCKOUT_MAX_ATTEMPTS) {
          prisma.auditLog.create({
            data: {
              action: 'auth.login_locked_out',
              entityType: 'user',
              entityId: email,
              actorEmail: email,
              details: JSON.stringify({ recentFailures, ip }),
            },
          }).catch(() => {})
          return null
        }

        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) {
          // Log failed attempt — wrong password
          prisma.auditLog.create({
            data: {
              action: 'auth.login_failed',
              entityType: 'user',
              entityId: email,
              actorEmail: email,
              details: JSON.stringify({ reason: 'wrong_password', ip }),
            },
          }).catch(() => {})
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string
        // Cache isAdmin + phone in JWT on sign-in
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { isAdmin: true, phone: true },
        })
        token.isAdmin = dbUser?.isAdmin ?? false
        token.phone = dbUser?.phone ?? ''
      }
      // Refresh isAdmin from DB on session update trigger
      if (trigger === 'update' && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { isAdmin: true, phone: true },
        })
        token.isAdmin = dbUser?.isAdmin ?? false
        token.phone = dbUser?.phone ?? ''
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = (token.isAdmin as boolean) ?? false
        session.user.phone = (token.phone as string) ?? ''
      }
      return session
    },
  },
  pages: {
    // Auth is embedded in booking flow — no standalone pages
    signIn: '/booking',
  },
})
