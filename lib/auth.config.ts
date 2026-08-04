import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

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
      authorize: async (credentials) => {
        const email = String(credentials.email)
        const password = String(credentials.password)

        if (!email || !password) return null

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user?.passwordHash) return null

        const valid = await verifyPassword(password, user.passwordHash)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // On first sign-in, inject isAdmin + phone from DB into the JWT
      if (user) {
        token.id = user.id as string
      }
      return token
    },
    async session({ session, token }) {
      // Enrich session with user data from JWT
      if (session.user) {
        session.user.id = token.id as string
        // Fetch isAdmin + phone from DB on session read
        // (keeps JWT lean, fetches only when needed)
        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { isAdmin: true, phone: true },
          })
          session.user.isAdmin = dbUser?.isAdmin ?? false
          session.user.phone = dbUser?.phone ?? ''
        }
      }
      return session
    },
  },
  pages: {
    // Auth is embedded in booking flow — no standalone pages
    signIn: '/booking',
  },
})
