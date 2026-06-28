import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockRecienNacido = {
  id: 1,
  personaId: 2,
  gestanteId: 1,
  createdAt: new Date('2026-06-24T00:00:00.000Z'),
  updatedAt: new Date(),
  deletedAt: null,
  persona: {
    id: 2,
    dni: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    fechaNacimiento: new Date('2026-06-01T00:00:00.000Z'),
  },
  pruebaCoombsDirecta: {
    id: 2,
    tipo: 'DIRECTO',
    positivo: false,
  },
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
    persona: { findFirst: vi.fn() },
    grupoSanguineo: { findUnique: vi.fn() },
    resultadoCoombs: {
      create: vi.fn(),
      update: vi.fn(),
    },
    recienNacido: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// =========================
// GET /api/v1/recien-nacidos?gestanteId=1
// =========================

describe('GET /api/v1/recien-nacidos', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.recienNacido.findMany).mockResolvedValue([mockRecienNacido])
    vi.mocked(prisma.recienNacido.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/recien-nacidos?gestanteId=1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0].persona.dni).toBe('12345678')
  })

  it('debe responder 404 cuando gestante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/recien-nacidos?gestanteId=999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Gestante no encontrada' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/recien-nacidos?gestanteId=1')

    expect(res.status).toBe(401)
  })
})

// =========================
// POST /api/v1/recien-nacidos/gestantes/:gestanteId/recien-nacidos
// =========================

describe('POST /api/v1/recien-nacidos/gestantes/:gestanteId/recien-nacidos', () => {
  it('debe responder 201 al crear recién nacido', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue({ id: 1, tipo: 'A', factorRh: 'POSITIVO' } as any)
    vi.mocked(prisma.$transaction).mockResolvedValue(mockRecienNacido)

    const res = await request(app)
      .post('/api/v1/recien-nacidos/gestantes/1/recien-nacidos')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento: '2026-06-01',
        direccion: 'Av. Siempre Viva 123',
        telefono: '1112345678',
        grupoSanguineoId: 1,
        pruebaCoombsDirecta: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.item.persona.dni).toBe('12345678')
    expect(res.body.data.item.pruebaCoombsDirecta.positivo).toBe(false)
  })

  it('debe responder 404 cuando gestante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/recien-nacidos/gestantes/999/recien-nacidos')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento: '2026-06-01',
        direccion: 'Av. Siempre Viva 123',
        telefono: '1112345678',
        grupoSanguineoId: 1,
        pruebaCoombsDirecta: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Gestante no encontrada' })
  })

  it('debe responder 409 cuando DNI ya existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.gestante.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue({ id: 99, dni: '12345678', deletedAt: null } as any)

    const res = await request(app)
      .post('/api/v1/recien-nacidos/gestantes/1/recien-nacidos')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento: '2026-06-01',
        direccion: 'Av. Siempre Viva 123',
        telefono: '1112345678',
        grupoSanguineoId: 1,
        pruebaCoombsDirecta: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({ success: false, error: 'El DNI ya existe en el sistema' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/recien-nacidos/gestantes/1/recien-nacidos')
      .send({
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento: '2026-06-01',
        direccion: 'Av. Siempre Viva 123',
        telefono: '1112345678',
        grupoSanguineoId: 1,
        pruebaCoombsDirecta: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(401)
  })
})

// =========================
// PUT /api/v1/recien-nacidos/:id
// =========================

describe('PUT /api/v1/recien-nacidos/:id', () => {
  it('debe responder 200 al actualizar', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.recienNacido.findFirst).mockResolvedValue(mockRecienNacido)
    vi.mocked(prisma.$transaction).mockResolvedValue({
      ...mockRecienNacido,
      persona: { ...mockRecienNacido.persona, nombre: 'Juan Carlos' },
      pruebaCoombsDirecta: { ...mockRecienNacido.pruebaCoombsDirecta, positivo: true },
    })

    const res = await request(app)
      .put('/api/v1/recien-nacidos/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        nombre: 'Juan Carlos',
        pruebaCoombsDirecta: { tipo: 'DIRECTO', positivo: true },
      })

    expect(res.status).toBe(200)
    expect(res.body.data.item.persona.nombre).toBe('Juan Carlos')
    expect(res.body.data.item.pruebaCoombsDirecta.positivo).toBe(true)
  })

  it('debe responder 404 cuando recién nacido no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.recienNacido.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/recien-nacidos/999')
      .set('Cookie', 'session_token=valid_token')
      .send({ nombre: 'Test' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Recién nacido no encontrado' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/recien-nacidos/1')
      .send({ nombre: 'Test' })

    expect(res.status).toBe(401)
  })
})

// =========================
// DELETE /api/v1/recien-nacidos/:id
// =========================

describe('DELETE /api/v1/recien-nacidos/:id', () => {
  it('debe responder 200 al eliminar', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.recienNacido.findFirst).mockResolvedValue(mockRecienNacido)
    vi.mocked(prisma.$transaction).mockResolvedValue(undefined)

    const res = await request(app)
      .delete('/api/v1/recien-nacidos/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, data: { message: 'Recién nacido eliminado correctamente' } })
  })

  it('debe responder 404 cuando recién nacido no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.recienNacido.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/recien-nacidos/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Recién nacido no encontrado' })
  })

  it('debe responder 403 para usuario no admin', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockUserSession)

    const res = await request(app)
      .delete('/api/v1/recien-nacidos/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(403)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/recien-nacidos/1')

    expect(res.status).toBe(401)
  })
})
