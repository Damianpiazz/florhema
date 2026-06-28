'use client'

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarFooter, useSidebar } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import { ChevronsUpDown, LogOut, Users, Heart, Stethoscope, Baby, Droplets, Shield, Venus, Droplet, BarChart3, ScrollText, UserCog, LayoutDashboard, Search, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/features/auth/auth-context'

const sections = [
  {
    title: 'Resumen',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'USER'],
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
      { title: 'Reportes', url: '/reportes', icon: BarChart3 },
    ],
  },
  {
    title: 'Hemoterapia',
    icon: Droplets,
    roles: ['ADMIN', 'USER'],
    items: [
      { title: 'Personas', url: '/personas', icon: Users },
      { title: 'Pacientes', url: '/pacientes', icon: Heart },
      { title: 'Donantes', url: '/donantes', icon: Heart },
      { title: 'Donaciones', url: '/donaciones', icon: Heart },
      { title: 'Transfusiones', url: '/transfusiones', icon: Stethoscope },
      { title: 'Grupos Sanguíneos', url: '/grupos-sanguineos', icon: Droplet },
    ],
  },
  {
    title: 'Obstetricia',
    icon: Baby,
    roles: ['ADMIN', 'USER'],
    items: [
      { title: 'Gestantes', url: '/gestantes', icon: Venus },
      { title: 'Recién Nacidos', url: '/recien-nacidos', icon: Baby },
      { title: 'Estudios Gestante', url: '/estudios-gestantes', icon: Baby },
    ],
  },
  {
    title: 'Administración',
    icon: Shield,
    roles: ['ADMIN'],
    items: [
      { title: 'Usuarios', url: '/usuarios', icon: UserCog },
      { title: 'Auditoría', url: '/auditoria', icon: ScrollText },
      { title: 'Papelera', url: '/papelera', icon: Trash2 },
    ],
  },
  {
    title: 'Consulta',
    icon: Search,
    roles: ['INVITADO'],
    items: [
      { title: 'Consulta Gestante', url: '/consulta-gestante', icon: Search },
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isMobile } = useSidebar()

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <img src="/icon-florhema.png" alt="Florhema" className="size-8" />
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Florhema</span>
                  <span className="text-xs text-muted-foreground">Hemoterapia</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {sections
          .filter((section) => section.roles.includes(user?.role ?? ''))
          .map((section) => {
            const SectionIcon = section.icon
            return (
              <SidebarGroup key={section.title}>
                <SidebarGroupLabel>
                  <SectionIcon className="size-3 mr-2" />
                  {section.title}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const ItemIcon = item.icon
                      return (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild isActive={pathname === item.url}>
                            <a href={item.url}>
                              <ItemIcon className="size-4" />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          })}
        </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {user?.name?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {user?.name || 'Usuario'}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {user?.name?.charAt(0)?.toUpperCase() ||
                          user?.email?.charAt(0)?.toUpperCase() ||
                          '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user?.name || 'Usuario'}
                      </span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}