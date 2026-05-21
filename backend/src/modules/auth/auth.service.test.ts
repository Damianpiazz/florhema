import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as authRepository from '@/modules/auth/auth.repository'
import * as sessionRepository from '@/modules/auth/session.repository'
import * as auditRepository from '@/modules/audit/audit.repository'
import type { RegisterInput } from '@/modules/auth/auth.schema'
import { register } from '@/modules/auth/auth.service'

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

const mockTokenRaw = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6'

vi.mock('@/utils/password', () => ({
  hashPassword: vi.fn(() => Promise.resolve('hashed_password_123'))
}))

vi.mock('@/utils/token', () => ({
  generateSessionToken: vi.fn(() => ({ raw: mockTokenRaw, hash: 'sha256_hash_123' }))
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn((cb: () => unknown) => cb())
  }
}))

vi.mock('@/modules/auth/auth.repository', () => ({
  findByEmail: vi.fn(),
  create: vi.fn()
}))

vi.mock('@/modules/auth/session.repository', () => ({
  create: vi.fn()
}))

vi.mock('@/modules/audit/audit.repository', () => ({
  create: vi.fn()
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('register', () => {
  it('debe crear usuario, sesion y auditoria cuando el email no existe', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(authRepository.create).mockResolvedValue(mockUser)

    const input: RegisterInput = {
      email: 'Test@Hospital.com ',
      password: '123456',
      name: 'Facundo Gómez'
    }

    const result = await register(input)

    expect(authRepository.findByEmail).toHaveBeenCalledWith('test@hospital.com')
    expect(authRepository.create).toHaveBeenCalledWith({
      email: 'test@hospital.com',
      password: 'hashed_password_123',
      name: 'Facundo Gómez',
      role: 'USER'
    })
    expect(sessionRepository.create).toHaveBeenCalledWith(1, 'sha256_hash_123', expect.any(Date))
    expect(auditRepository.create).toHaveBeenCalledWith({
      userId: 1,
      action: 'CREATE',
      entity: 'User',
      entityId: 1,
      newValues: { email: 'test@hospital.com', role: 'USER' }
    })
    expect(result).toEqual({
      user: { id: 1, email: 'test@hospital.com', name: 'Facundo Gómez', role: 'USER' },
      tokenRaw: mockTokenRaw
    })
  })

  it('debe lanzar AppError 409 cuando el email ya esta registrado', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue(mockUser)

    const input: RegisterInput = {
      email: 'test@hospital.com',
      password: '123456'
    }

    await expect(register(input)).rejects.toMatchObject({
      statusCode: 409,
      message: 'El email ya está registrado'
    })

    expect(authRepository.create).not.toHaveBeenCalled()
    expect(sessionRepository.create).not.toHaveBeenCalled()
  })

  it('debe normalizar el email a minusculas y sin espacios', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(authRepository.create).mockResolvedValue(mockUser)

    const input: RegisterInput = {
      email: '  Test@Hospital.com  ',
      password: '123456',
      name: 'Facundo'
    }

    await register(input)

    expect(authRepository.findByEmail).toHaveBeenCalledWith('test@hospital.com')
    expect(authRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@hospital.com' })
    )
  })

  it('debe retornar user sin password y con tokenRaw en texto plano', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(authRepository.create).mockResolvedValue(mockUser)

    const input: RegisterInput = {
      email: 'test@hospital.com',
      password: '123456'
    }

    const result = await register(input)

    expect(result.user).not.toHaveProperty('password')
    expect(typeof result.tokenRaw).toBe('string')
    expect(result.tokenRaw).toBe(mockTokenRaw)
  })
})
