"use client"

import { useAuth } from '@/features/auth/auth-context'

export function useLogout() {
  const { logout } = useAuth()
  return { logout }
}
