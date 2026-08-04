'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'

type User = { id: string; name?: string | null; email?: string | null; phone?: string; isAdmin?: boolean }

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  sessionReady: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
  updateProfile: (data: { name?: string; phone?: string }) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [localUser, setLocalUser] = useState<User | null>(null)

  const sessionReady = status !== 'loading'

  // Derive user from Auth.js session
  useEffect(() => {
    if (session?.user) {
      setLocalUser({
        id: (session.user as { id?: string }).id ?? '',
        name: session.user.name,
        email: session.user.email,
        phone: (session.user as { phone?: string }).phone ?? '',
        isAdmin: (session.user as { isAdmin?: boolean }).isAdmin ?? false,
      })
    } else if (sessionReady && !session) {
      setLocalUser(null)
    }
  }, [session, sessionReady])

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      if (response.status === 409) {
        throw new Error(data.error || 'Email already registered')
      }
      throw new Error('Registration failed')
    }

    const data = await response.json()
    const newUser = data.user as User
    // After registration, sign in with credentials to create Auth.js session
    await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })
    return newUser
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await nextAuthSignIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return !result?.error
  }

  const logout = () => {
    nextAuthSignOut({ redirect: false })
  }

  const updateProfile = (data: { name?: string; phone?: string }) => {
    if (localUser === null) return
    setLocalUser({ ...localUser, ...data })
  }

  return (
    <UserContext.Provider
      value={{
        user: localUser,
        isAuthenticated: localUser !== null && !!session,
        isAdmin: localUser?.isAdmin ?? false,
        sessionReady,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
