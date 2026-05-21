"use client"

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/features/auth/hooks/useLogout'

export function LogoutButton() {
  const { logout } = useLogout()

  return (
    <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesión">
      <LogOut className="size-5" />
    </Button>
  )
}
