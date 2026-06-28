import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockEstudio = {
  id: 1,
  gestanteId: 1,
  fecha: new Date('2026-06-01T10:00:00.000Z'),
  compatibilidadConyugal: 'Compatible - Grupo O+ ambos',
  estadoEstudio: 'PENDIENTE' as const,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  pruebaCoombsIndirecta: {
    id: 1,
    tipo: 'INDIRECTO' as const,
    positivo: false,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
} as any

const mockEstudioFinalizado = {
  ...mockEstudio,
  estadoEstudio: 'FINALIZADO' as const,
  pruebaCoombsIndirecta: { ...mockEstudio.pruebaCoombsIndirecta, positivo: true },
}

const mockGestante = {
  id: 1,
  personaId: 1,
  antecedentesObstetricos: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any

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

const mockUserSession = {
  ...mockSession,
  user: { ...mockSession.user, role: 'USER' as const },
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    gestante: { findFirst: vi.fn() },
    estudioGestante: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    resultadoCoombs: { create: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
    $transaction: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// =========================
// GET /api/v1/estudios-gestante/gestantes/:gestanteId/estudios
// =========================

describe('GET /api/v1/estudios-gestante/gestantes/:gestanteId/estudios', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(mockGestante)
    vi.mocked(prisma.estudioGestante.findMany).mockResolvedValue([mockEstudio])
    vi.mocked(prisma.estudioGestante.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/estudios-gestante/gestantes/1/estudios')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        items: [
          {
            id: 1,
            gestanteId: 1,
            fecha: mockEstudio.fecha.toISOString(),
            compatibilidadConyugal: 'Compatible - Grupo O+ ambos',
            estadoEstudio: 'PENDIENTE',
            pruebaCoombsIndirecta: { id: 1, tipo: 'INDIRECTO', positivo: false },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    })
  })

  it('debe responder 200 con items vacío cuando no hay estudios', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(mockGestante)
    vi.mocked(prisma.estudioGestante.findMany).mockResolvedValue([])
    vi.mocked(prisma.estudioGestante.count).mockResolvedValue(0)

    const res = await request(app)
      .get('/api/v1/estudios-gestante/gestantes/1/estudios')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toEqual([])
    expect(res.body.data.total).toBe(0)
  })

  it('debe responder 404 cuando gestante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/estudios-gestante/gestantes/999/estudios')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Gestante no encontrada' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/estudios-gestante/gestantes/1/estudios')

    expect(res.status).toBe(401)
  })
})

// =========================
// POST /api/v1/estudios-gestante/gestantes/:gestanteId/estudios
// =========================

describe('POST /api/v1/estudios-gestante/gestantes/:gestanteId/estudios', () => {
  it('debe responder 201 al crear estudio', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(mockGestante)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        resultadoCoombs: { create: vi.fn().mockResolvedValue({ id: 1 }) },
        estudioGestante: { create: vi.fn().mockResolvedValue(mockEstudio) },
      }
      return cb(tx)
    })

    const res = await request(app)
      .post('/api/v1/estudios-gestante/gestantes/1/estudios')
      .set('Cookie', 'session_token=valid_token')
      .send({
        fecha: '2026-06-01T10:00:00.000Z',
        compatibilidadConyugal: 'Compatible - Grupo O+ ambos',
        estadoEstudio: 'PENDIENTE',
        pruebaCoombsIndirecta: { tipo: 'INDIRECTO', positivo: false },
      })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          gestanteId: 1,
          fecha: mockEstudio.fecha.toISOString(),
          compatibilidadConyugal: 'Compatible - Grupo O+ ambos',
          estadoEstudio: 'PENDIENTE',
          pruebaCoombsIndirecta: { id: 1, tipo: 'INDIRECTO', positivo: false },
        },
      },
    })
  })

  it('debe responder 404 cuando gestante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/estudios-gestante/gestantes/999/estudios')
      .set('Cookie', 'session_token=valid_token')
      .send({
        fecha: '2026-06-01T10:00:00.000Z',
        compatibilidadConyugal: 'Compatible',
        estadoEstudio: 'PENDIENTE',
        pruebaCoombsIndirecta: { tipo: 'INDIRECTO', positivo: false },
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Gestante no encontrada' })
  })

  it('debe responder 400 cuando compatibilidadConyugal está vacío', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/estudios-gestante/gestantes/1/estudios')
      .set('Cookie', 'session_token=valid_token')
      .send({
        fecha: '2026-06-01T10:00:00.000Z',
        compatibilidadConyugal: '',
        estadoEstudio: 'PENDIENTE',
        pruebaCoombsIndirecta: { tipo: 'INDIRECTO', positivo: false },
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/estudios-gestante/gestantes/1/estudios')
      .send({
        fecha: '2026-06-01T10:00:00.000Z',
        compatibilidadConyugal: 'Compatible',
        estadoEstudio: 'PENDIENTE',
        pruebaCoombsIndirecta: { tipo: 'INDIRECTO', positivo: false },
      })

    expect(res.status).toBe(401)
  })
})

// =========================
// PUT /api/v1/estudios-gestante/:id
// =========================

describe('PUT /api/v1/estudios-gestante/:id', () => {
  it('debe responder 200 al actualizar estudio', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.estudioGestante.findFirst).mockResolvedValue(mockEstudio)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        resultadoCoombs: { update: vi.fn().mockResolvedValue({}) },
        estudioGestante: { update: vi.fn().mockResolvedValue(mockEstudioFinalizado) },
      }
      return cb(tx)
    })

    const res = await request(app)
      .put('/api/v1/estudios-gestante/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        estadoEstudio: 'FINALIZADO',
        pruebaCoombsIndirecta: { tipo: 'INDIRECTO', positivo: true },
      })

    expect(res.status).toBe(200)
    expect(res.body.data.item.estadoEstudio).toBe('FINALIZADO')
    expect(res.body.data.item.pruebaCoombsIndirecta.positivo).toBe(true)
  })

  it('debe responder 404 cuando estudio no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.estudioGestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/estudios-gestante/999')
      .set('Cookie', 'session_token=valid_token')
      .send({ estadoEstudio: 'FINALIZADO' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Estudio no encontrado' })
  })

  it('debe responder 400 cuando body está vacío', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .put('/api/v1/estudios-gestante/1')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(400)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/estudios-gestante/1')
      .send({ estadoEstudio: 'FINALIZADO' })

    expect(res.status).toBe(401)
  })
})

// =========================
// DELETE /api/v1/estudios-gestante/:id
// =========================

describe('DELETE /api/v1/estudios-gestante/:id', () => {
  it('debe responder 200 al eliminar estudio', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.estudioGestante.findFirst).mockResolvedValue(mockEstudio)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        estudioGestante: { update: vi.fn().mockResolvedValue({}) },
        resultadoCoombs: { update: vi.fn().mockResolvedValue({}) },
      }
      return cb(tx)
    })

    const res = await request(app)
      .delete('/api/v1/estudios-gestante/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, data: null })
  })

  it('debe responder 404 cuando estudio no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.estudioGestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/estudios-gestante/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Estudio no encontrado' })
  })

  it('debe responder 403 para usuario no admin', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockUserSession)

    const res = await request(app)
      .delete('/api/v1/estudios-gestante/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(403)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/estudios-gestante/1')

    expect(res.status).toBe(401)
  })
})
