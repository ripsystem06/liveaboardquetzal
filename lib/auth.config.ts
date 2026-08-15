import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { verifyOtpCode } from '@/lib/otp'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'Code', type: 'text' },
        name: { label: 'Name', type: 'text' },
      },
      authorize: async (credentials, request) => {
        const email = String(credentials?.email ?? '')
        const otp = String(credentials?.otp ?? '')
        const name = credentials?.name ? String(credentials.name) : undefined

        if (!email || !otp) return null

        // Rate limit: 5 verify attempts per minute per IP
        const ip = getClientIP(request as unknown as Request)
        const rl = checkRateLimit(`otp:verify:${ip}`, 5, 60_000)
        if (!rl.allowed) {
          prisma.auditLog.create({
            data: {
              action: 'auth.otp_rate_limited',
              entityType: 'user',
              entityId: email,
              actorEmail: email,
              details: JSON.stringify({ ip }),
            },
          }).catch(() => {})
          return null
        }

        const result = await verifyOtpCode(email, otp)
        if (!result.ok) {
          const action = result.reason === 'locked' ? 'auth.otp_locked_out' : 'auth.otp_failed'
          prisma.auditLog.create({
            data: {
              action,
              entityType: 'user',
              entityId: email,
              actorEmail: email,
              details: JSON.stringify({ reason: result.reason, ip }),
            },
          }).catch(() => {})
          return null
        }

        // Upsert user: create the account on first successful OTP login.
        // User.name is non-nullable, so derive a fallback from the email local-part.
        let user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
          const fallbackName = name || email.split('@')[0] || 'Guest'
          user = await prisma.user.create({
            data: { email, name: fallbackName, phone: '' },
          })
          prisma.auditLog.create({
            data: {
              action: 'user.registered',
              entityType: 'user',
              entityId: user.id,
              actorEmail: email,
            },
          }).catch(() => {})
        }

        prisma.auditLog.create({
          data: {
            action: 'auth.otp_consumed',
            entityType: 'user',
            entityId: email,
            actorEmail: email,
          },
        }).catch(() => {})

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
