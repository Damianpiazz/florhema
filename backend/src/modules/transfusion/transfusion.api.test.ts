import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockTransfusiones = [
  {
    id: 1,
    pacienteId: 1,
    fecha: new Date('2026-06-01T10:00:00.000Z'),
    componente: 'GLOBULOS_ROJOS' as const,
    cantidadUnidades: 2,
    reaccionAdversa: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    paciente: {
      id: 1,
      personaId: 1,
      persona: {
        id: 1,
        dni: '87654321',
        nombre: 'María',
        apellido: 'García',
      },
    },
    compatibilidad: {
      id: 1,
      compatible: true,
      motivoIncompatibilidad: null,
      donanteGrupo: { id: 1, tipo: 'O' as const, factorRh: 'NEGATIVO' as const },
      receptorGrupo: { id: 2, tipo: 'O' as const, factorRh: 'POSITIVO' as const },
    },
    resultadoCoombs: {
      id: 1,
      tipo: 'DIRECTO' as const,
      positivo: false,
    },
  },
] as any

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
} as any

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    transfusion: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    paciente: { findFirst: vi.fn() },
    grupoSanguineo: { findFirst: vi.fn() },
    resultadoCoombs: { create: vi.fn(), update: vi.fn() },
    compatibilidadTransfusional: { create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// =========================
// GET /api/v1/transfusiones
// =========================

describe('GET /api/v1/transfusiones', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue(mockTransfusiones)
    vi.mocked(prisma.transfusion.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/transfusiones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        items: [
          {
            id: 1,
            paciente: { id: 1, personaId: 1, nombre: 'María', apellido: 'García', dni: '87654321' },
            fecha: mockTransfusiones[0].fecha.toISOString(),
            componente: 'GLOBULOS_ROJOS',
            cantidadUnidades: 2,
            reaccionAdversa: null,
            compatibilidad: {
              id: 1,
              compatible: true,
              motivoIncompatibilidad: null,
              donanteGrupo: { id: 1, tipo: 'O', factorRh: 'NEGATIVO' },
              receptorGrupo: { id: 2, tipo: 'O', factorRh: 'POSITIVO' },
            },
            resultadoCoombs: { id: 1, tipo: 'DIRECTO', positivo: false },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    })
  })

  it('debe responder 200 con items vacío cuando no hay transfusiones', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue([])
    vi.mocked(prisma.transfusion.count).mockResolvedValue(0)

    const res = await request(app)
      .get('/api/v1/transfusiones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toEqual([])
    expect(res.body.data.total).toBe(0)
  })

  it('debe filtrar por pacienteId', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue([])
    vi.mocked(prisma.transfusion.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/transfusiones?pacienteId=1')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.transfusion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          pacienteId: 1,
        }),
      }),
    )
  })

  it('debe filtrar por componente', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue([])
    vi.mocked(prisma.transfusion.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/transfusiones?componente=PLASMA')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.transfusion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          componente: 'PLASMA',
        }),
      }),
    )
  })

  it('debe filtrar por rango de fechas', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue([])
    vi.mocked(prisma.transfusion.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/transfusiones?fechaDesde=2026-01-01&fechaHasta=2026-12-31')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.transfusion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fecha: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      }),
    )
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/transfusiones')

    expect(res.status).toBe(401)
  })
})

// =========================
// GET /api/v1/transfusiones/:id
// =========================

describe('GET /api/v1/transfusiones/:id', () => {
  it('debe responder 200 con la transfusión', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findFirst).mockResolvedValue(mockTransfusiones[0])

    const res = await request(app)
      .get('/api/v1/transfusiones/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          paciente: { id: 1, personaId: 1, nombre: 'María', apellido: 'García', dni: '87654321' },
          fecha: mockTransfusiones[0].fecha.toISOString(),
          componente: 'GLOBULOS_ROJOS',
          cantidadUnidades: 2,
          reaccionAdversa: null,
          compatibilidad: {
            id: 1,
            compatible: true,
            motivoIncompatibilidad: null,
            donanteGrupo: { id: 1, tipo: 'O', factorRh: 'NEGATIVO' },
            receptorGrupo: { id: 2, tipo: 'O', factorRh: 'POSITIVO' },
          },
          resultadoCoombs: { id: 1, tipo: 'DIRECTO', positivo: false },
        },
      },
    })
  })

  it('debe responder 404 cuando la transfusión no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/transfusiones/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Transfusión no encontrada',
    })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/transfusiones/1')

    expect(res.status).toBe(401)
  })
})

// =========================
// POST /api/v1/transfusiones
// =========================

describe('POST /api/v1/transfusiones', () => {
  it('debe responder 201 al crear transfusión', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.grupoSanguineo.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        resultadoCoombs: { create: vi.fn().mockResolvedValue({ id: 1 }) },
        compatibilidadTransfusional: { create: vi.fn().mockResolvedValue({ id: 1 }) },
        transfusion: { create: vi.fn().mockResolvedValue(mockTransfusiones[0]) },
      }
      return cb(tx)
    })

    const res = await request(app)
      .post('/api/v1/transfusiones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        fecha: '2026-06-01T10:00:00.000Z',
        componente: 'GLOBULOS_ROJOS',
        cantidadUnidades: 2,
        compatibilidad: { donanteGrupoId: 1, receptorGrupoId: 2, compatible: true },
        resultadoCoombs: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          paciente: { id: 1, personaId: 1, nombre: 'María', apellido: 'García', dni: '87654321' },
          fecha: mockTransfusiones[0].fecha.toISOString(),
          componente: 'GLOBULOS_ROJOS',
          cantidadUnidades: 2,
          reaccionAdversa: null,
          compatibilidad: {
            id: 1,
            compatible: true,
            motivoIncompatibilidad: null,
            donanteGrupo: { id: 1, tipo: 'O', factorRh: 'NEGATIVO' },
            receptorGrupo: { id: 2, tipo: 'O', factorRh: 'POSITIVO' },
          },
          resultadoCoombs: { id: 1, tipo: 'DIRECTO', positivo: false },
        },
      },
    })
  })

  it('debe responder 404 cuando paciente no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/transfusiones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '99999999',
        fecha: '2026-06-01T10:00:00.000Z',
        componente: 'GLOBULOS_ROJOS',
        cantidadUnidades: 2,
        compatibilidad: { donanteGrupoId: 1, receptorGrupoId: 2, compatible: true },
        resultadoCoombs: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Paciente no encontrado' })
  })

  it('debe responder 404 cuando grupo donante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.grupoSanguineo.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/transfusiones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        fecha: '2026-06-01T10:00:00.000Z',
        componente: 'GLOBULOS_ROJOS',
        cantidadUnidades: 2,
        compatibilidad: { donanteGrupoId: 999, receptorGrupoId: 2, compatible: true },
        resultadoCoombs: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(404)
  })

  it('debe responder 400 cuando cantidadUnidades es 0', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/transfusiones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        fecha: '2026-06-01T10:00:00.000Z',
        componente: 'GLOBULOS_ROJOS',
        cantidadUnidades: 0,
        compatibilidad: { donanteGrupoId: 1, receptorGrupoId: 2, compatible: true },
        resultadoCoombs: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 400 cuando componente es inválido', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/transfusiones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        fecha: '2026-06-01T10:00:00.000Z',
        componente: 'INVALIDO',
        cantidadUnidades: 2,
        compatibilidad: { donanteGrupoId: 1, receptorGrupoId: 2, compatible: true },
        resultadoCoombs: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/transfusiones')
      .send({
        dni: '87654321',
        fecha: '2026-06-01T10:00:00.000Z',
        componente: 'GLOBULOS_ROJOS',
        cantidadUnidades: 2,
        compatibilidad: { donanteGrupoId: 1, receptorGrupoId: 2, compatible: true },
        resultadoCoombs: { tipo: 'DIRECTO', positivo: false },
      })

    expect(res.status).toBe(401)
  })
})

// =========================
// PUT /api/v1/transfusiones/:id
// =========================

describe('PUT /api/v1/transfusiones/:id', () => {
  it('debe responder 200 al actualizar transfusión', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findFirst).mockResolvedValue(mockTransfusiones[0])
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        transfusion: {
          findFirst: vi.fn().mockResolvedValue(mockTransfusiones[0]),
          update: vi.fn().mockResolvedValue({
            ...mockTransfusiones[0],
            cantidadUnidades: 3,
            componente: 'PLASMA',
          }),
        },
      }
      return cb(tx)
    })

    const res = await request(app)
      .put('/api/v1/transfusiones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        componente: 'PLASMA',
        cantidadUnidades: 3,
        reaccionAdversa: 'Fiebre leve',
      })

    expect(res.status).toBe(200)
  })

  it('debe responder 200 al actualizar con upsert de compatibilidad', async () => {
    const { prisma } = await import('@/lib/prisma')

    const sinCompatibilidad = { ...mockTransfusiones[0], compatibilidadId: null, compatibilidad: null } as any

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findFirst).mockResolvedValueOnce(sinCompatibilidad)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        transfusion: {
          findFirst: vi.fn().mockResolvedValue(sinCompatibilidad),
          update: vi.fn().mockResolvedValue(mockTransfusiones[0]),
        },
        compatibilidadTransfusional: { create: vi.fn().mockResolvedValue({ id: 1 }) },
      }
      return cb(tx)
    })

    const res = await request(app)
      .put('/api/v1/transfusiones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        compatibilidad: { donanteGrupoId: 1, receptorGrupoId: 2, compatible: true },
      })

    expect(res.status).toBe(200)
  })

  it('debe responder 400 cuando el body está vacío', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .put('/api/v1/transfusiones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(400)
  })

  it('debe responder 404 cuando la transfusión no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/transfusiones/999')
      .set('Cookie', 'session_token=valid_token')
      .send({ cantidadUnidades: 3 })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Transfusión no encontrada' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/transfusiones/1')
      .send({ cantidadUnidades: 3 })

    expect(res.status).toBe(401)
  })
})

// =========================
// DELETE /api/v1/transfusiones/:id
// =========================

describe('DELETE /api/v1/transfusiones/:id', () => {
  it('debe responder 200 al eliminar (soft-delete)', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findFirst).mockResolvedValue(mockTransfusiones[0])
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      const tx = {
        transfusion: {
          findFirst: vi.fn().mockResolvedValue(mockTransfusiones[0]),
          update: vi.fn().mockResolvedValue({ ...mockTransfusiones[0], deletedAt: new Date() }),
        },
        compatibilidadTransfusional: { update: vi.fn() },
        resultadoCoombs: { update: vi.fn() },
      }
      return cb(tx)
    })

    const res = await request(app)
      .delete('/api/v1/transfusiones/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, data: null })
  })

  it('debe responder 404 cuando la transfusión no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.transfusion.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/transfusiones/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Transfusión no encontrada' })
  })

  it('debe responder 403 cuando el usuario no es ADMIN', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      ...mockSession,
      user: { ...mockSession.user, role: 'USER' as const },
    } as any)

    const res = await request(app)
      .delete('/api/v1/transfusiones/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(403)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/transfusiones/1')

    expect(res.status).toBe(401)
  })
})
