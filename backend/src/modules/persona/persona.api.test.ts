import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockPersonas = [
  {
    id: 1,
    dni: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    fechaNacimiento: new Date('1990-05-15'),
    direccion: 'Av. Siempre Viva 123',
    telefono: '1112345678',
    grupoSanguineoId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdById: null,
    updatedById: null,
    deletedById: null,
    grupoSanguineo: { id: 1, tipo: 'O', factorRh: 'POSITIVO' },
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
    persona: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/v1/personas', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findMany).mockResolvedValue(mockPersonas)
    vi.mocked(prisma.persona.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/personas')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        items: [
          {
            id: 1,
            dni: '12345678',
            nombre: 'Juan',
            apellido: 'Pérez',
            fechaNacimiento: '1990-05-15T00:00:00.000Z',
            direccion: 'Av. Siempre Viva 123',
            telefono: '1112345678',
            grupoSanguineo: { id: 1, tipo: 'O', factorRh: 'POSITIVO' },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    })
  })

  it('debe responder 200 con items vacio cuando no hay personas', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findMany).mockResolvedValue([])
    vi.mocked(prisma.persona.count).mockResolvedValue(0)

    const res = await request(app)
      .get('/api/v1/personas')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toEqual([])
    expect(res.body.data.total).toBe(0)
  })

  it('debe filtrar por dni', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findMany).mockResolvedValue([])
    vi.mocked(prisma.persona.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/personas?dni=123')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.persona.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          dni: { contains: '123' },
        }),
      }),
    )
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/personas')

    expect(res.status).toBe(401)
  })
})