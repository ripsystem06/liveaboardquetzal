import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      isAdmin?: boolean
      phone?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    isAdmin?: boolean
    phone?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    isAdmin?: boolean
    phone?: string
  }
}
