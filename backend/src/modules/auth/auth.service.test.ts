import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authRepository from '@/modules/auth/auth.repository'
import * as sessionRepository from '@/modules/auth/session.repository'
import type { LoginInput } from '@/modules/auth/auth.schema'
import { login, logout } from '@/modules/auth/auth.service'

const mockUser = {
  id: 1,
  email: 'test@hospital.com',
  name: 'Facundo Gómez',
  role: 'USER' as const,
  createdAt: new Date('2026-05-17T12:00:00.000Z'),
  updatedAt: new Date('2026-05-17T12:00:00.000Z'),
  deletedAt: null,
  createdById: null,
  updatedById: null,
  deletedById: null
}

const mockUserWithPassword = {
  ...mockUser,
  password: '$2b$10$hashed_password_123'
}

const mockUserSoftDeleted = {
  ...mockUserWithPassword,
  deletedAt: new Date('2026-05-18T12:00:00.000Z')
}

const mockTokenRaw = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6'

vi.mock('@/utils/password', () => ({
  verifyPassword: vi.fn()
}))

vi.mock('@/utils/token', () => ({
  generateSessionToken: vi.fn(() => ({ raw: mockTokenRaw, hash: 'sha256_hash_123' }))
}))

vi.mock('@/modules/auth/auth.repository', () => ({
  findByEmailWithPassword: vi.fn()
}))

vi.mock('@/modules/auth/session.repository', () => ({
  create: vi.fn(),
  revoke: vi.fn()
}))

import * as passwordUtils from '@/utils/password'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('login', () => {
  it('debe autenticar usuario con credenciales validas y retornar user + tokenRaw', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(mockUserWithPassword)
    vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(true)

    const input: LoginInput = {
      email: 'test@hospital.com',
      password: '123456'
    }

    const result = await login(input)

    expect(authRepository.findByEmailWithPassword).toHaveBeenCalledWith('test@hospital.com')
    expect(passwordUtils.verifyPassword).toHaveBeenCalledWith('123456', mockUserWithPassword.password)
    expect(sessionRepository.create).toHaveBeenCalledWith(1, 'sha256_hash_123', expect.any(Date))
    expect(result).toEqual({
      user: { id: 1, email: 'test@hospital.com', name: 'Facundo Gómez', role: 'USER' },
      tokenRaw: mockTokenRaw
    })
  })

  it('debe lanzar AppError 401 cuando el email no existe', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(null)

    const input: LoginInput = {
      email: 'noexiste@hospital.com',
      password: '123456'
    }

    await expect(login(input)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Email o contraseña incorrectos'
    })

    expect(sessionRepository.create).not.toHaveBeenCalled()
  })

  it('debe lanzar AppError 401 cuando la contraseña es incorrecta', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(mockUserWithPassword)
    vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(false)

    const input: LoginInput = {
      email: 'test@hospital.com',
      password: 'wrongpassword'
    }

    await expect(login(input)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Email o contraseña incorrectos'
    })

    expect(sessionRepository.create).not.toHaveBeenCalled()
  })

  it('debe lanzar AppError 401 cuando el usuario esta soft-deleted', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(mockUserSoftDeleted)

    const input: LoginInput = {
      email: 'test@hospital.com',
      password: '123456'
    }

    await expect(login(input)).rejects.toMatchObject({
      statusCode: 401,
      message: 'Email o contraseña incorrectos'
    })

    expect(passwordUtils.verifyPassword).not.toHaveBeenCalled()
    expect(sessionRepository.create).not.toHaveBeenCalled()
  })

  it('debe normalizar el email a minusculas y sin espacios antes de buscar', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(mockUserWithPassword)
    vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(true)

    const input: LoginInput = {
      email: '  Test@Hospital.com  ',
      password: '123456'
    }

    await login(input)

    expect(authRepository.findByEmailWithPassword).toHaveBeenCalledWith('test@hospital.com')
  })

  it('debe retornar user sin password', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(mockUserWithPassword)
    vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(true)

    const input: LoginInput = {
      email: 'test@hospital.com',
      password: '123456'
    }

    const result = await login(input)

    expect(result.user).not.toHaveProperty('password')
  })
})

describe('logout', () => {
  it('debe revocar la sesion con el token hash proporcionado', async () => {
    await logout('sha256_hash_123')

    expect(sessionRepository.revoke).toHaveBeenCalledWith('sha256_hash_123')
  })

  it('debe lanzar error si falla la revocacion', async () => {
    vi.mocked(sessionRepository.revoke).mockRejectedValue(new Error('Database error'))

    await expect(logout('sha256_hash_123')).rejects.toThrow('Database error')
  })
})
