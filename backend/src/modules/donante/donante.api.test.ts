import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockDonantes = [
  {
    id: 1,
    personaId: 1,
    semaforoAptitud: 'VERDE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    persona: {
      id: 1,
      dni: '12345678',
      nombre: 'Juan',
      apellido: 'Pérez',
    },
  },
]

const mockSession = {
  id: 1,
  userId: 1,
  tokenHash: 'valid_token_hash',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 86400000),
  revokedAt: null,
  user: {
    id: 1,
    email: 'admin@hospital.com',
    name: 'Admin',
    role: 'ADMIN' as const,
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    donante: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/v1/donantes', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findMany).mockResolvedValue(mockDonantes)
    vi.mocked(prisma.donante.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/donantes')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        items: [
          {
            id: 1,
            personaId: 1,
            persona: { id: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez' },
            semaforoAptitud: 'VERDE',
            createdAt: mockDonantes[0].createdAt.toISOString(),
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    })
  })

  it('debe responder 200 con items vacío cuando no hay donantes', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findMany).mockResolvedValue([])
    vi.mocked(prisma.donante.count).mockResolvedValue(0)

    const res = await request(app)
      .get('/api/v1/donantes')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toEqual([])
    expect(res.body.data.total).toBe(0)
  })

  it('debe filtrar por dni', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findMany).mockResolvedValue([])
    vi.mocked(prisma.donante.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/donantes?dni=123')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.donante.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          persona: expect.objectContaining({
            dni: { contains: '123' },
          }),
        }),
      }),
    )
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/donantes')

    expect(res.status).toBe(401)
  })
})

describe('GET /api/v1/donantes/:id', () => {
  it('debe responder 200 con el donante', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findFirst).mockResolvedValue(mockDonantes[0])

    const res = await request(app)
      .get('/api/v1/donantes/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          personaId: 1,
          persona: { id: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez' },
          semaforoAptitud: 'VERDE',
          createdAt: mockDonantes[0].createdAt.toISOString(),
        },
      },
    })
  })

  it('debe responder 404 cuando el donante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/donantes/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Donante no encontrado',
    })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/donantes/1')

    expect(res.status).toBe(401)
  })
})
