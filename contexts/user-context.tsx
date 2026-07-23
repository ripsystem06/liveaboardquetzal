'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type User = { id: string; name: string; email: string; phone: string; isAdmin: boolean }

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
  const [user, setUser] = useState<User | null>(null)
  const [sessionReady, setSessionReady] = useState(false)

  // Restore session from sessionStorage on mount (survives refresh, dies on tab close)
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('quetzal_user')
      if (stored !== null) {
        const parsed = JSON.parse(stored) as User
        setUser(parsed)
      }
    } catch {
      // Corrupted data — ignore, user stays logged out
    } finally {
      setSessionReady(true)
    }
  }, [])

  const register = async (name: string, email: string, password: string): Promise<User> => {
    const response = await fetch('/api/auth/session', {
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
    setUser(newUser)
    sessionStorage.setItem('quetzal_user', JSON.stringify(newUser))
    return newUser
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) return false

    const data = await response.json()
    const loggedInUser = data.user as User
    setUser(loggedInUser)
    sessionStorage.setItem('quetzal_user', JSON.stringify(loggedInUser))
    return true
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('quetzal_user')
    // Clear server session cookie so API routes no longer authenticate
    fetch('/api/auth/session', { method: 'DELETE' }).catch(() => {})
  }

  const updateProfile = (data: { name?: string; phone?: string }) => {
    if (user === null) return
    const updated = { ...user, ...data }
    setUser(updated)
    sessionStorage.setItem('quetzal_user', JSON.stringify(updated))
  }

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isAdmin: user?.isAdmin ?? false,
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
