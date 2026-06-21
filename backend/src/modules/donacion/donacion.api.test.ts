import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockDonaciones = [
  {
    id: 1,
    donanteId: 1,
    fecha: new Date('2026-05-20T10:00:00.000Z'),
    peso: 75,
    tensionArterial: '120/80',
    hemoglobina: 14.5,
    tipoDonacion: 'VOLUNTARIA',
    reaccionAdversa: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    donante: {
      id: 1,
      personaId: 1,
      semaforoAptitud: 'VERDE',
      persona: {
        id: 1,
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
      },
    },
    resultadoSerologia: {
      id: 1,
      donacionId: 1,
      hiv: false,
      hcv: false,
      hbv: false,
      chagas: false,
      sifilis: false,
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
    donacion: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    donante: {
      findFirst: vi.fn(),
    },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/v1/donaciones', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findMany).mockResolvedValue(mockDonaciones)
    vi.mocked(prisma.donacion.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        items: [
          {
            id: 1,
            donante: { id: 1, personaId: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez' },
            fecha: mockDonaciones[0].fecha.toISOString(),
            peso: 75,
            tensionArterial: '120/80',
            hemoglobina: 14.5,
            tipoDonacion: 'VOLUNTARIA',
            reaccionAdversa: null,
            resultadoSerologia: {
              id: 1, hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false,
            },
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      },
    })
  })

  it('debe responder 200 con items vacío cuando no hay donaciones', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findMany).mockResolvedValue([])
    vi.mocked(prisma.donacion.count).mockResolvedValue(0)

    const res = await request(app)
      .get('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toEqual([])
    expect(res.body.data.total).toBe(0)
  })

  it('debe filtrar por donanteId', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findMany).mockResolvedValue([])
    vi.mocked(prisma.donacion.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/donaciones?donanteId=1')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.donacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          donanteId: 1,
        }),
      }),
    )
  })

  it('debe filtrar por tipoDonacion', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findMany).mockResolvedValue([])
    vi.mocked(prisma.donacion.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/donaciones?tipoDonacion=REPOSICION')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.donacion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tipoDonacion: 'REPOSICION',
        }),
      }),
    )
  })

  it('debe filtrar por rango de fechas', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findMany).mockResolvedValue([])
    vi.mocked(prisma.donacion.count).mockResolvedValue(0)

    await request(app)
      .get('/api/v1/donaciones?fechaDesde=2026-01-01&fechaHasta=2026-12-31')
      .set('Cookie', 'session_token=valid_token')

    expect(prisma.donacion.findMany).toHaveBeenCalledWith(
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

    const res = await request(app).get('/api/v1/donaciones')

    expect(res.status).toBe(401)
  })
})

describe('POST /api/v1/donaciones', () => {
  it('debe responder 201 al crear con serología', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findFirst).mockResolvedValue({ id: 1, deletedAt: null })
    vi.mocked(prisma.donacion.create).mockResolvedValue(mockDonaciones[0])

    const res = await request(app)
      .post('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
        resultadoSerologia: { hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false },
      })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          donante: { id: 1, personaId: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez' },
          fecha: mockDonaciones[0].fecha.toISOString(),
          peso: 75,
          tensionArterial: '120/80',
          hemoglobina: 14.5,
          tipoDonacion: 'VOLUNTARIA',
          reaccionAdversa: null,
          resultadoSerologia: {
            id: 1, hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false,
          },
        },
      },
    })
  })

  it('debe responder 201 al crear sin serología', async () => {
    const { prisma } = await import('@/lib/prisma')

    const mockSinSerologia = { ...mockDonaciones[0], resultadoSerologia: null }

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findFirst).mockResolvedValue({ id: 1, deletedAt: null })
    vi.mocked(prisma.donacion.create).mockResolvedValue(mockSinSerologia)

    const res = await request(app)
      .post('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(201)
    expect(res.body.data.item.resultadoSerologia).toBeNull()
  })

  it('debe responder 400 cuando peso < 50', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 40,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 400 cuando hemoglobina < 12.5', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 10,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 400 cuando TA tiene formato inválido', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120x80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 404 cuando donante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '99999999',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Donante no encontrado' })
  })

  it('debe responder 404 cuando donante está soft-deleted', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/donaciones')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(404)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/donaciones')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(401)
  })
})

describe('GET /api/v1/donaciones/:id', () => {
  it('debe responder 200 con la donación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findFirst).mockResolvedValue(mockDonaciones[0])

    const res = await request(app)
      .get('/api/v1/donaciones/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          donante: { id: 1, personaId: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez' },
          fecha: mockDonaciones[0].fecha.toISOString(),
          peso: 75,
          tensionArterial: '120/80',
          hemoglobina: 14.5,
          tipoDonacion: 'VOLUNTARIA',
          reaccionAdversa: null,
          resultadoSerologia: {
            id: 1, hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false,
          },
        },
      },
    })
  })

  it('debe responder 404 cuando la donación no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/donaciones/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Donación no encontrada',
    })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/donaciones/1')

    expect(res.status).toBe(401)
  })
})

describe('PUT /api/v1/donaciones/:id', () => {
  it('debe responder 200 al actualizar sin serología', async () => {
    const { prisma } = await import('@/lib/prisma')

    const mockSinSerologia = { ...mockDonaciones[0], resultadoSerologia: null }

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findFirst).mockResolvedValueOnce(mockDonaciones[0])
    vi.mocked(prisma.donante.findFirst).mockResolvedValue({ id: 1, deletedAt: null })
    vi.mocked(prisma.donacion.update).mockResolvedValue(mockSinSerologia)

    const res = await request(app)
      .put('/api/v1/donaciones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 80,
        tensionArterial: '130/85',
        hemoglobina: 15,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(200)
    expect(res.body.data.item.resultadoSerologia).toBeNull()
  })

  it('debe responder 200 al actualizar con serología', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findFirst).mockResolvedValueOnce(mockDonaciones[0])
    vi.mocked(prisma.donante.findFirst).mockResolvedValue({ id: 1, deletedAt: null })
    vi.mocked(prisma.donacion.update).mockResolvedValue(mockDonaciones[0])

    const res = await request(app)
      .put('/api/v1/donaciones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
        resultadoSerologia: { hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false },
      })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          donante: { id: 1, personaId: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez' },
          fecha: mockDonaciones[0].fecha.toISOString(),
          peso: 75,
          tensionArterial: '120/80',
          hemoglobina: 14.5,
          tipoDonacion: 'VOLUNTARIA',
          reaccionAdversa: null,
          resultadoSerologia: {
            id: 1, hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false,
          },
        },
      },
    })
  })

  it('debe responder 400 cuando peso < 50', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .put('/api/v1/donaciones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 40,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 400 cuando hemoglobina < 12.5', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .put('/api/v1/donaciones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 10,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 400 cuando TA tiene formato inválido', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .put('/api/v1/donaciones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120x80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(400)
  })

  it('debe responder 404 cuando donación no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/donaciones/999')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Donación no encontrada' })
  })

  it('debe responder 404 cuando donante no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.donacion.findFirst).mockResolvedValue(mockDonaciones[0])
    vi.mocked(prisma.donante.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/donaciones/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '99999999',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Donante no encontrado' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/donaciones/1')
      .send({
        dni: '12345678',
        fecha: '2026-05-20T10:00:00.000Z',
        peso: 75,
        tensionArterial: '120/80',
        hemoglobina: 14.5,
        tipoDonacion: 'VOLUNTARIA',
      })

    expect(res.status).toBe(401)
  })
})
