"use client"

import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/features/auth/hooks/useLogout'

interface LogoutTriggerProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs' | 'icon-xs' | 'icon-sm' | 'icon-lg'
  className?: string
  showIcon?: boolean
  children?: ReactNode
  onClick?: () => void
}

export function LogoutTrigger({
  variant = 'default',
  size = 'default',
  className,
  showIcon = true,
  children,
  onClick,
}: LogoutTriggerProps) {
  const { logout } = useLogout()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        logout()
        onClick?.()
      }}
    >
      {showIcon && <LogOut className="size-4" />}
      {children ?? 'Cerrar sesión'}
    </Button>
  )
}