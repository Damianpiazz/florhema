"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/features/auth/auth-context'

export function RegisterForm() {
  const { register } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await register(email, password, name)
      router.push('/')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error del servidor. Intente nuevamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm mx-auto">
      <h1 className="text-2xl font-bold">Registro</h1>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">
          {error}
        </div>
      )}

      <label className="flex flex-col gap-1">
        Nombre
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border rounded p-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        Contraseña
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="border rounded p-2"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white rounded p-2 disabled:opacity-50"
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  )
}
