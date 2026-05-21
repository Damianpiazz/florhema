"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

import { authService, type User } from '@/features/auth/auth-service'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  register: (email: string, password: string, name?: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const user = await authService.getMe()
      setUser(user)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const register = async (email: string, password: string, name?: string) => {
    const user = await authService.register({ email, password, name })
    setUser(user)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, loading, register, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
