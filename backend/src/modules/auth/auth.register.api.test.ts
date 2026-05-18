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
const mockTokenRaw = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6'
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
import * as authRepository from '@/modules/auth/auth.repository'
beforeEach(() => {
  vi.clearAllMocks()
})
describe('POST /api/v1/auth/register', () => {
  it('debe responder 201 con success true y data cuando el registro es exitoso', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue(null)
    vi.mocked(authRepository.create).mockResolvedValue(mockUser)
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@hospital.com', password: '123456', name: 'Facundo Gómez' })
    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      success: true,
      data: {
        user: { id: 1, email: 'test@hospital.com', name: 'Facundo Gómez', role: 'USER' },
        token: mockTokenRaw
      }
    })
  })
  it('debe responder 400 con success false cuando el email es invalido', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'email-invalido', password: '123456' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      success: false,
      error: 'Email inválido'
    })
  })
  it('debe responder 400 con success false cuando la password es menor a 6 caracteres', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@hospital.com', password: '123' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      success: false,
      error: 'La contraseña debe tener al menos 6 caracteres'
    })
  })
  it('debe responder 409 con success false cuando el email ya esta registrado', async () => {
    vi.mocked(authRepository.findByEmail).mockResolvedValue(mockUser)
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@hospital.com', password: '123456' })
    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'El email ya está registrado'
    })
  })
})
