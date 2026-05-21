import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

vi.mock('@/lib/axios', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn()
  }
}))

const mockPost = vi.mocked((await import('@/lib/axios')).api.post)
const mockGet = vi.mocked((await import('@/lib/axios')).api.get)

import { authService } from '@/features/auth/auth-service'

const validUser = {
  id: 1,
  email: 'test@hospital.com',
  name: 'Facundo',
  role: 'ADMIN' as const
}

const validResponse = {
  success: true as const,
  data: { user: validUser }
}

describe('authService.login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('llama POST /auth/login con el input', async () => {
    mockPost.mockResolvedValue({ data: validResponse })

    await authService.login({ email: 'test@hospital.com', password: '123456' })

    expect(mockPost).toHaveBeenCalledWith('/auth/login', {
      email: 'test@hospital.com',
      password: '123456'
    })
  })

  it('retorna User en exito', async () => {
    mockPost.mockResolvedValue({ data: validResponse })

    const result = await authService.login({ email: 'test@hospital.com', password: '123456' })

    expect(result).toEqual(validUser)
  })

  it('propaga el error del interceptor de axios', async () => {
    mockPost.mockRejectedValue(new Error('Email o contraseña incorrectos'))

    await expect(authService.login({ email: 'bad@email.com', password: 'wrong' })).rejects.toThrow(
      'Email o contraseña incorrectos'
    )
  })
})

describe('authService.getMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna User cuando hay sesion', async () => {
    mockGet.mockResolvedValue({ data: validResponse })

    const result = await authService.getMe()

    expect(mockGet).toHaveBeenCalledWith('/auth/me')
    expect(result).toEqual(validUser)
  })

  it('retorna null cuando no hay sesion (error 401)', async () => {
    mockGet.mockRejectedValue(new Error('No autenticado'))

    const result = await authService.getMe()

    expect(result).toBeNull()
  })

  it('retorna null cuando la API falla', async () => {
    mockGet.mockRejectedValue(new Error('Network Error'))

    const result = await authService.getMe()

    expect(result).toBeNull()
  })
})
