'use client'

import { useAuth } from '@/features/auth/auth-context'

export function usePermissions() {
  const { user } = useAuth()
  const role = user?.role

  return {
    canCreate: role === 'ADMIN' || role === 'USER',
    canEdit: role === 'ADMIN' || role === 'USER',
    canDelete: role === 'ADMIN',
    canViewAdmin: role === 'ADMIN',
    isAdmin: role === 'ADMIN',
    isUser: role === 'USER',
    isInvitado: role === 'INVITADO',
    role,
  }
}
