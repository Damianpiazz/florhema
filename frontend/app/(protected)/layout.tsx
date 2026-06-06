'use client'

import React, { useEffect } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { usePathname, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login')
    }
  }, [loading, isAuthenticated, router])

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">Cargando...</div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Redirigiendo al login...
      </div>
    )
  }

  const segments = pathname.split('/').filter(Boolean)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {segments.length === 0 ? (
                <BreadcrumbItem>
                  <BreadcrumbPage>Inicio</BreadcrumbPage>
                </BreadcrumbItem>
              ) : (
                segments.map((segment, i) => {
                  const label = segment
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase())
                  const href = '/' + segments.slice(0, i + 1).join('/')
                  const isLast = i === segments.length - 1

                  return (
                    <React.Fragment key={segment}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={href}>{label}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  )
                })
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}