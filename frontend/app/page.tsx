"use client"
import { useAuth } from '@/features/auth/auth-context'
import { LogoutButton } from '@/features/auth/components/logout-button'
export default function Home() {
  const { user, isAuthenticated, loading } = useAuth()
  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Cargando...</p>
      </main>
    )
  }
  if (isAuthenticated && user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Bienvenido, {user.name || user.email}</h1>
          <p className="text-gray-500">Role: {user.role}</p>
          <p className="mt-2 text-green-600">Sesión activa</p>
          <LogoutButton></LogoutButton>
        </div>
      </main>
    )
  }
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Florhema</h1>
        <p className="text-gray-500">No estás autenticado</p>

      </div>
    </main>
  )
}