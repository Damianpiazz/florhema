import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockTokenRaw = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6'
const mockTokenHash = '15e60b1b2f63c6f66e3d3e1d4e7b8f9a0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6'

const mockSession = {
  id: 1,
  userId: 1,
  tokenHash: mockTokenHash,
  createdAt: new Date('2026-05-17T12:00:00.000Z'),
  expiresAt: new Date(Date.now() + 86400000),
  revokedAt: null,
  user: {
    id: 1,
    email: 'test@hospital.com',
    name: 'Facundo Gómez',
    role: 'USER' as const,
  }
}

const mockRevokedSession = {
  ...mockSession,
  revokedAt: new Date('2026-05-18T12:00:00.000Z')
}

const mockExpiredSession = {
  ...mockSession,
  expiresAt: new Date(Date.now() - 86400000)
}

vi.mock('@/lib/prisma', () => {
  const mockFindUnique = vi.fn()
  return {
    prisma: {
      session: {
        findUnique: mockFindUnique,
        update: vi.fn()
      }
    }
  }
})

vi.mock('@/modules/auth/session.repository', () => ({
  create: vi.fn(),
  revoke: vi.fn()
}))

import * as sessionRepository from '@/modules/auth/session.repository'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/v1/auth/logout', () => {
  it('debe responder 200 con success true cuando el logout es exitoso', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', `session_token=${mockTokenRaw}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: { message: 'Sesión cerrada exitosamente' }
    })
    expect(sessionRepository.revoke).toHaveBeenCalledWith(expect.any(String))
  })

  it('debe responder 401 sin cookie de sesion', async () => {
    const res = await request(app)
      .post('/api/v1/auth/logout')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'No autenticado'
    })
  })

  it('debe responder 401 cuando la sesion no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', `session_token=invalidtoken`)

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'No autenticado'
    })
  })

  it('debe responder 401 cuando la sesion esta revocada', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockRevokedSession)

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', `session_token=${mockTokenRaw}`)

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'Sesión revocada'
    })
  })

  it('debe responder 401 cuando la sesion esta expirada', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockExpiredSession)

    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', `session_token=${mockTokenRaw}`)

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'Sesión expirada'
    })
  })
})
