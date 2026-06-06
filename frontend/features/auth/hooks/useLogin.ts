"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { extractErrorMessage } from '@/utils/error-utils'
import { loginSchema } from '@/features/auth/auth.schema'
import { useAuth } from '@/features/auth/auth-context'

interface LoginErrors {
  email?: string
  password?: string
  general?: string
}

export function useLogin(redirectTo = '/personas') {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    const result = loginSchema.safeParse({ email, password })

    if (!result.success) {
      const fieldErrors: LoginErrors = {}
      for (const issue of result.error.issues) {
        if (issue.path.includes('email')) {
          fieldErrors.email = issue.message
        }
        if (issue.path.includes('password')) {
          fieldErrors.password = issue.message
        }
      }
      setErrors(fieldErrors)
      setLoading(false)
      return
    }

    try {
      await login(email, password)
      setSuccess(true)
      setTimeout(() => router.push(redirectTo), 800)
    } catch (err: unknown) {
      setErrors({ general: extractErrorMessage(err, 'Error del servidor. Intente nuevamente.') })
    } finally {
      setLoading(false)
    }
  }, [email, password, login, router, redirectTo])

  return {
    email,
    setEmail,
    password,
    setPassword,
    errors,
    loading,
    success,
    handleSubmit,
  }
}
