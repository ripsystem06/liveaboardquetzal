'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { ADMIN_EMAIL } from '@/lib/config'

type User = { id: string; name: string; email: string; phone: string; isAdmin: boolean }

interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<User>
  logout: () => void
  updateProfile: (data: { name?: string; phone?: string }) => void
}

const MOCK_USER: User = {
  id: '1',
  name: 'Demo User',
  email: 'demo@quetzal.com',
  phone: '+1 555 0100',
  isAdmin: false,
}

const VALID_EMAIL = 'demo@quetzal.com'
const VALID_PASSWORD = '123456'

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

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
    }
  }, [])

  const register = async (name: string, email: string, password: string): Promise<User> => {
    // Mock: generate id from email hash, empty phone
    const newUser: User = {
      id: `user-${btoa(email).slice(0, 8)}`,
      name,
      email,
      phone: '',
      isAdmin: email === ADMIN_EMAIL,
    }
    setUser(newUser)
    sessionStorage.setItem('quetzal_user', JSON.stringify(newUser))
    return newUser
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      setUser(MOCK_USER)
      sessionStorage.setItem('quetzal_user', JSON.stringify(MOCK_USER))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('quetzal_user')
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