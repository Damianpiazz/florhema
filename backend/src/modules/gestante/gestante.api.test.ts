import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockGestante = {
  id: 1,
  personaId: 1,
  antecedentesObstetricos: 'G2P1, cesárea previa en 2024',
  createdAt: new Date('2026-06-24T00:00:00.000Z'),
  updatedAt: new Date(),
  deletedAt: null,
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

const mockGestanteConPersona = {
  ...mockGestante,
  persona: { id: 1, dni: '12345678', nombre: 'María', apellido: 'González' },
} as any

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    persona: { findFirst: vi.fn() },
    gestante: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    estudioGestante: { count: vi.fn() },
    recienNacido: { count: vi.fn() },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// =========================
// GET /api/v1/gestantes
// =========================

describe('GET /api/v1/gestantes', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findMany).mockResolvedValue([mockGestanteConPersona])
    vi.mocked(prisma.gestante.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/gestantes')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0].persona.dni).toBe('12345678')
    expect(res.body.data.total).toBe(1)
  })

  it('debe responder 200 vacío cuando no hay gestantes', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findMany).mockResolvedValue([])
    vi.mocked(prisma.gestante.count).mockResolvedValue(0)

    const res = await request(app)
      .get('/api/v1/gestantes')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(0)
    expect(res.body.data.total).toBe(0)
  })

  it('debe filtrar por dni', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findMany).mockResolvedValue([mockGestanteConPersona])
    vi.mocked(prisma.gestante.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/gestantes?dni=12345678')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(1)
    expect(vi.mocked(prisma.gestante.findMany).mock.calls[0][0]?.where?.persona?.dni).toEqual({ contains: '12345678' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/gestantes')

    expect(res.status).toBe(401)
  })
})

// =========================
// POST /api/v1/personas/:personaId/gestante
// =========================

describe('POST /api/v1/personas/:personaId/gestante', () => {
  it('debe responder 201 al crear gestante', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.gestante.create).mockResolvedValue(mockGestanteConPersona)

    const res = await request(app)
      .post('/api/v1/personas/1/gestante')
      .set('Cookie', 'session_token=valid_token')
      .send({ antecedentesObstetricos: 'G2P1, cesárea previa en 2024' })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.item.persona.dni).toBe('12345678')
    expect(res.body.data.item.antecedentesObstetricos).toBe('G2P1, cesárea previa en 2024')
  })

  it('debe responder 201 con antecedentes nulos cuando no se envían', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.gestante.create).mockResolvedValue({
      ...mockGestanteConPersona,
      antecedentesObstetricos: null,
    } as any)

    const res = await request(app)
      .post('/api/v1/personas/1/gestante')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(201)
    expect(res.body.data.item.antecedentesObstetricos).toBeNull()
  })

  it('debe responder 404 cuando persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/personas/999/gestante')
      .set('Cookie', 'session_token=valid_token')
      .send({ antecedentesObstetricos: 'test' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Persona no encontrada' })
  })

  it('debe responder 409 cuando persona ya es gestante', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(mockGestanteConPersona)

    const res = await request(app)
      .post('/api/v1/personas/1/gestante')
      .set('Cookie', 'session_token=valid_token')
      .send({ antecedentesObstetricos: 'test' })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({ success: false, error: 'La persona ya está registrada como gestante' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/personas/1/gestante')
      .send({ antecedentesObstetricos: 'test' })

    expect(res.status).toBe(401)
  })
})

// =========================
// PUT /api/v1/gestantes/:id
// =========================

describe('PUT /api/v1/gestantes/:id', () => {
  it('debe responder 200 al actualizar gestante', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(mockGestanteConPersona)
    vi.mocked(prisma.gestante.update).mockResolvedValue({
      ...mockGestanteConPersona,
      antecedentesObstetricos: 'G3P2, dos cesáreas, un parto vaginal',
    })

    const res = await request(app)
      .put('/api/v1/gestantes/1')
      .set('Cookie', 'session_token=valid_token')
      .send({ antecedentesObstetricos: 'G3P2, dos cesáreas, un parto vaginal' })

    expect(res.status).toBe(200)
    expect(res.body.data.item.antecedentesObstetricos).toBe('G3P2, dos cesáreas, un parto vaginal')
  })

  it('debe responder 404 cuando gestante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/gestantes/999')
      .set('Cookie', 'session_token=valid_token')
      .send({ antecedentesObstetricos: 'test' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Gestante no encontrada' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/gestantes/1')
      .send({ antecedentesObstetricos: 'test' })

    expect(res.status).toBe(401)
  })
})

// =========================
// DELETE /api/v1/gestantes/:id
// =========================

describe('DELETE /api/v1/gestantes/:id', () => {
  it('debe responder 200 al eliminar gestante', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(mockGestanteConPersona)
    vi.mocked(prisma.estudioGestante.count).mockResolvedValue(0)
    vi.mocked(prisma.recienNacido.count).mockResolvedValue(0)
    vi.mocked(prisma.gestante.update).mockResolvedValue({ ...mockGestanteConPersona, deletedAt: new Date() })

    const res = await request(app)
      .delete('/api/v1/gestantes/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, data: null })
  })

  it('debe responder 404 cuando gestante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/gestantes/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Gestante no encontrada' })
  })

  it('debe responder 409 cuando tiene estudios activos', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(mockGestanteConPersona)
    vi.mocked(prisma.estudioGestante.count).mockResolvedValueOnce(1)

    const res = await request(app)
      .delete('/api/v1/gestantes/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'No se puede eliminar la gestante porque tiene estudios o recién nacidos activos',
    })
  })

  it('debe responder 403 para usuario no admin', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockUserSession)

    const res = await request(app)
      .delete('/api/v1/gestantes/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(403)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/gestantes/1')

    expect(res.status).toBe(401)
  })
})
