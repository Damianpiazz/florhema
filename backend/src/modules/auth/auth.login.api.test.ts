import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

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

const mockTokenRaw = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6'

vi.mock('@/modules/auth/auth.repository', () => ({
  findByEmailWithPassword: vi.fn(),
  findByEmail: vi.fn(),
  create: vi.fn(),
  findById: vi.fn()
}))

vi.mock('@/modules/auth/session.repository', () => ({
  create: vi.fn()
}))

vi.mock('@/modules/audit/audit.repository', () => ({
  create: vi.fn()
}))

vi.mock('@/utils/password', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn()
}))

vi.mock('@/utils/token', () => ({
  generateSessionToken: vi.fn(() => ({ raw: mockTokenRaw, hash: 'sha256_hash_123' }))
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn((cb: () => unknown) => cb())
  }
}))

import * as authRepository from '@/modules/auth/auth.repository'
import * as passwordUtils from '@/utils/password'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/v1/auth/login', () => {
  it('debe responder 200 con success true y setear cookie cuando el login es exitoso', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(mockUserWithPassword)
    vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(true)

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@hospital.com', password: '123456' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        user: { id: 1, email: 'test@hospital.com', name: 'Facundo Gómez', role: 'USER' }
      }
    })
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.headers['set-cookie'][0]).toContain('session_token')
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly')
  })

  it('debe responder 400 con success false cuando el email es invalido', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'email-invalido', password: '123456' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      success: false,
      error: 'Email inválido'
    })
  })

  it('debe responder 400 con success false cuando la password esta vacia', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@hospital.com', password: '' })

    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      success: false,
      error: 'La contraseña es requerida'
    })
  })

  it('debe responder 401 con mensaje generico cuando el email no existe', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'noexiste@hospital.com', password: '123456' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'Email o contraseña incorrectos'
    })
  })

  it('debe responder 401 con mensaje generico cuando la contraseña es incorrecta', async () => {
    vi.mocked(authRepository.findByEmailWithPassword).mockResolvedValue(mockUserWithPassword)
    vi.mocked(passwordUtils.verifyPassword).mockResolvedValue(false)

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'test@hospital.com', password: 'wrongpassword' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'Email o contraseña incorrectos'
    })
  })
})
