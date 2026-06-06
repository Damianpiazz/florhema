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
    grupoSanguineo: { id: 1, tipo: 'O', factorRh: 'POSITIVO' },
  },
]

const mockCreatedPersona = {
  id: 2,
  dni: '87654321',
  nombre: 'María',
  apellido: 'García',
  fechaNacimiento: new Date('1985-10-20'),
  direccion: 'Calle Falsa 456',
  telefono: '1198765432',
  grupoSanguineoId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  grupoSanguineo: { id: 2, tipo: 'A', factorRh: 'POSITIVO' },
}

const mockUpdatedPersona = {
  id: 1,
  dni: '12345678',
  nombre: 'Juan Carlos',
  apellido: 'Pérez',
  fechaNacimiento: new Date('1990-05-15'),
  direccion: 'Nueva dirección 456',
  telefono: '1112345678',
  grupoSanguineoId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  grupoSanguineo: { id: 2, tipo: 'A', factorRh: 'POSITIVO' },
}

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
  id: 2,
  userId: 2,
  tokenHash: 'user_token_hash',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 86400000),
  revokedAt: null,
  user: {
    id: 2,
    email: 'user@hospital.com',
    name: 'User',
    role: 'USER' as const,
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    persona: {
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    grupoSanguineo: {
      findUnique: vi.fn(),
    },
    donante: {
      count: vi.fn(),
    },
    paciente: {
      count: vi.fn(),
    },
    gestante: {
      count: vi.fn(),
    },
    donacion: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    transfusion: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    estudioGestante: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    recienNacido: {
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

describe('POST /api/v1/personas', () => {
  it('debe responder 201 al crear una persona exitosamente', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue({
      id: 2,
      tipo: 'A',
      factorRh: 'POSITIVO',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(prisma.persona.create).mockResolvedValue(mockCreatedPersona)

    const res = await request(app)
      .post('/api/v1/personas')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        nombre: 'María',
        apellido: 'García',
        fechaNacimiento: '1985-10-20',
        direccion: 'Calle Falsa 456',
        telefono: '1198765432',
        grupoSanguineoId: 2,
      })

    expect(res.status).toBe(201)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 2,
          dni: '87654321',
          nombre: 'María',
          apellido: 'García',
          fechaNacimiento: '1985-10-20T00:00:00.000Z',
          direccion: 'Calle Falsa 456',
          telefono: '1198765432',
          grupoSanguineo: { id: 2, tipo: 'A', factorRh: 'POSITIVO' },
        },
      },
    })
  })

  it('debe responder 409 cuando el DNI ya existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findUnique).mockResolvedValue(mockPersonas[0])

    const res = await request(app)
      .post('/api/v1/personas')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        nombre: 'Juan',
        apellido: 'Pérez',
        fechaNacimiento: '1990-05-15',
        direccion: 'Av. Siempre Viva 123',
        telefono: '1112345678',
        grupoSanguineoId: 1,
      })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'El DNI ya existe en el sistema',
    })
  })

  it('debe responder 404 cuando el grupo sanguíneo no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/personas')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        nombre: 'María',
        apellido: 'García',
        fechaNacimiento: '1985-10-20',
        direccion: 'Calle Falsa 456',
        telefono: '1198765432',
        grupoSanguineoId: 999,
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'El grupo sanguíneo indicado no existe',
    })
  })

  it('debe responder 400 cuando faltan campos obligatorios', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .post('/api/v1/personas')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(400)
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/personas')
      .send({
        dni: '87654321',
        nombre: 'María',
        apellido: 'García',
        fechaNacimiento: '1985-10-20',
        direccion: 'Calle Falsa 456',
        telefono: '1198765432',
        grupoSanguineoId: 2,
      })

    expect(res.status).toBe(401)
  })
})

describe('PUT /api/v1/personas/:id', () => {
  it('debe responder 200 al actualizar una persona exitosamente', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValueOnce(mockPersonas[0])
    vi.mocked(prisma.persona.findFirst).mockResolvedValueOnce(null)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue({
      id: 2,
      tipo: 'A',
      factorRh: 'POSITIVO',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    vi.mocked(prisma.persona.update).mockResolvedValue(mockUpdatedPersona)

    const res = await request(app)
      .put('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
        fechaNacimiento: '1990-05-15',
        direccion: 'Nueva dirección 456',
        telefono: '1112345678',
        grupoSanguineoId: 2,
      })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: {
          id: 1,
          dni: '12345678',
          nombre: 'Juan Carlos',
          apellido: 'Pérez',
          fechaNacimiento: '1990-05-15T00:00:00.000Z',
          direccion: 'Nueva dirección 456',
          telefono: '1112345678',
          grupoSanguineo: { id: 2, tipo: 'A', factorRh: 'POSITIVO' },
        },
      },
    })
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/personas/999')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        nombre: 'María',
        apellido: 'García',
        fechaNacimiento: '1985-10-20',
        direccion: 'Calle Falsa 456',
        telefono: '1198765432',
        grupoSanguineoId: 2,
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Persona no encontrada',
    })
  })

  it('debe responder 409 cuando el DNI pertenece a otra persona', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValueOnce(mockPersonas[0])
    vi.mocked(prisma.persona.findFirst).mockResolvedValueOnce(mockPersonas[0])

    const res = await request(app)
      .put('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '87654321',
        nombre: 'María',
        apellido: 'García',
        fechaNacimiento: '1985-10-20',
        direccion: 'Calle Falsa 456',
        telefono: '1198765432',
        grupoSanguineoId: 2,
      })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'El DNI ya pertenece a otra persona',
    })
  })

  it('debe responder 404 cuando el grupo sanguíneo no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValueOnce(mockPersonas[0])
    vi.mocked(prisma.persona.findFirst).mockResolvedValueOnce(null)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')
      .send({
        dni: '12345678',
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
        fechaNacimiento: '1990-05-15',
        direccion: 'Nueva dirección 456',
        telefono: '1112345678',
        grupoSanguineoId: 999,
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'El grupo sanguíneo indicado no existe',
    })
  })

  it('debe responder 400 con datos inválidos', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)

    const res = await request(app)
      .put('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')
      .send({ dni: '' })

    expect(res.status).toBe(400)
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/personas/1')
      .send({
        dni: '12345678',
        nombre: 'Juan Carlos',
        apellido: 'Pérez',
        fechaNacimiento: '1990-05-15',
        direccion: 'Nueva dirección 456',
        telefono: '1112345678',
        grupoSanguineoId: 2,
      })

    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/v1/personas/:id', () => {
  it('debe responder 200 al eliminar una persona exitosamente', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.donante.count).mockResolvedValue(0)
    vi.mocked(prisma.paciente.count).mockResolvedValue(0)
    vi.mocked(prisma.gestante.count).mockResolvedValue(0)
    vi.mocked(prisma.persona.update).mockResolvedValue({
      ...mockPersonas[0],
      deletedAt: new Date(),
    })

    const res = await request(app)
      .delete('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: { message: 'Persona eliminada correctamente' },
    })
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/personas/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Persona no encontrada',
    })
  })

  it('debe responder 409 cuando la persona tiene vinculaciones activas', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.donante.count).mockResolvedValue(1)
    vi.mocked(prisma.paciente.count).mockResolvedValue(0)
    vi.mocked(prisma.gestante.count).mockResolvedValue(0)

    const res = await request(app)
      .delete('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'No se puede eliminar la persona porque tiene un donante, paciente o gestante activo',
    })
  })

  it('debe responder 403 cuando el usuario no es ADMIN', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockUserSession)

    const res = await request(app)
      .delete('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(403)
    expect(res.body).toEqual({
      success: false,
      error: 'Acción no permitida. Se requiere rol ADMIN',
    })
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).delete('/api/v1/personas/1')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'No autenticado',
    })
  })
})

// =========================
// GET /api/v1/personas/:id (DETALLE)
// =========================

const mockPersonaWithRoles = {
  ...mockPersonas[0],
  donante: { id: 1, semaforoAptitud: 'VERDE' },
  paciente: null,
  gestante: null,
}

describe('GET /api/v1/personas/:id (detalle)', () => {
  it('debe responder 200 con datos de persona y roles', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonaWithRoles)

    const res = await request(app)
      .get('/api/v1/personas/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({
      id: 1,
      dni: '12345678',
      donante: { id: 1, semaforoAptitud: 'VERDE' },
      paciente: null,
      gestante: null,
    })
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/personas/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Persona no encontrada',
    })
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/personas/1')

    expect(res.status).toBe(401)
  })
})

// =========================
// GET /api/v1/personas/:id/donaciones
// =========================

const mockDonaciones = [
  {
    id: 1,
    donanteId: 1,
    fecha: new Date('2026-05-20'),
    peso: 75,
    tensionArterial: '120/80',
    hemoglobina: 14.5,
    tipoDonacion: 'VOLUNTARIA' as const,
    reaccionAdversa: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    resultadoSerologia: { id: 1, hiv: false, hcv: false, hbv: false, chagas: false, sifilis: false },
  },
]

describe('GET /api/v1/personas/:id/donaciones', () => {
  it('debe responder 200 con lista paginada de donaciones', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.donacion.findMany).mockResolvedValue(mockDonaciones)
    vi.mocked(prisma.donacion.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/personas/1/donaciones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0]).toMatchObject({
      id: 1,
      tipoDonacion: 'VOLUNTARIA',
      resultadoSerologia: { hiv: false },
    })
    expect(res.body.data.total).toBe(1)
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/personas/999/donaciones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).get('/api/v1/personas/1/donaciones')
    expect(res.status).toBe(401)
  })
})

// =========================
// GET /api/v1/personas/:id/transfusiones
// =========================

const mockTransfusiones = [
  {
    id: 1,
    pacienteId: 1,
    fecha: new Date('2026-04-10'),
    componente: 'GLOBULOS_ROJOS' as const,
    cantidadUnidades: 2,
    reaccionAdversa: null,
    compatibilidadId: null,
    resultadoCoombsId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    compatibilidad: {
      id: 1,
      compatible: true,
      motivoIncompatibilidad: null,
      donanteGrupo: { id: 1, tipo: 'O' as const, factorRh: 'NEGATIVO' as const },
      receptorGrupo: { id: 2, tipo: 'O' as const, factorRh: 'POSITIVO' as const },
    },
    resultadoCoombs: null,
  },
]

describe('GET /api/v1/personas/:id/transfusiones', () => {
  it('debe responder 200 con lista paginada de transfusiones', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue(mockTransfusiones)
    vi.mocked(prisma.transfusion.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/personas/1/transfusiones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0]).toMatchObject({
      id: 1,
      componente: 'GLOBULOS_ROJOS',
      compatibilidad: { compatible: true },
    })
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/personas/999/transfusiones')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)
    const res = await request(app).get('/api/v1/personas/1/transfusiones')
    expect(res.status).toBe(401)
  })
})

// =========================
// GET /api/v1/personas/:id/estudios-gestante
// =========================

const mockEstudios = [
  {
    id: 1,
    gestanteId: 1,
    fecha: new Date('2026-03-05'),
    compatibilidadConyugal: 'Compatible',
    estadoEstudio: 'PENDIENTE' as const,
    pruebaCoombsIndirectaId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    pruebaCoombsIndirecta: { id: 1, tipo: 'INDIRECTO' as const, positivo: false },
  },
]

describe('GET /api/v1/personas/:id/estudios-gestante', () => {
  it('debe responder 200 con lista paginada de estudios', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.estudioGestante.findMany).mockResolvedValue(mockEstudios)
    vi.mocked(prisma.estudioGestante.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/personas/1/estudios-gestante')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0]).toMatchObject({
      id: 1,
      estadoEstudio: 'PENDIENTE',
      pruebaCoombsIndirecta: { positivo: false },
    })
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/personas/999/estudios-gestante')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)
    const res = await request(app).get('/api/v1/personas/1/estudios-gestante')
    expect(res.status).toBe(401)
  })
})

// =========================
// GET /api/v1/personas/:id/recien-nacidos
// =========================

const mockRecienNacidos = [
  {
    id: 1,
    personaId: 2,
    gestanteId: 1,
    pruebaCoombsDirectaId: 1,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date(),
    deletedAt: null,
    pruebaCoombsDirecta: { id: 1, tipo: 'DIRECTO' as const, positivo: true },
  },
]

describe('GET /api/v1/personas/:id/recien-nacidos', () => {
  it('debe responder 200 con lista paginada de recien nacidos', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.recienNacido.findMany).mockResolvedValue(mockRecienNacidos)
    vi.mocked(prisma.recienNacido.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/personas/1/recien-nacidos')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0]).toMatchObject({
      id: 1,
      personaId: 2,
      pruebaCoombsDirecta: { positivo: true },
    })
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/personas/999/recien-nacidos')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)
    const res = await request(app).get('/api/v1/personas/1/recien-nacidos')
    expect(res.status).toBe(401)
  })
})

// =========================
// GET /api/v1/personas/:id/actividad
// =========================

describe('GET /api/v1/personas/:id/actividad', () => {
  it('debe responder 200 con timeline mezclado y ordenado por fecha', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.donacion.findMany).mockResolvedValue(mockDonaciones)
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue(mockTransfusiones)
    vi.mocked(prisma.estudioGestante.findMany).mockResolvedValue(mockEstudios)
    vi.mocked(prisma.recienNacido.findMany).mockResolvedValue(mockRecienNacidos)

    const res = await request(app)
      .get('/api/v1/personas/1/actividad')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items.length).toBeGreaterThan(0)
    // items should be sorted by fecha descending
    const items = res.body.data.items
    for (let i = 1; i < items.length; i++) {
      expect(new Date(items[i - 1].fecha).getTime()).toBeGreaterThanOrEqual(
        new Date(items[i].fecha).getTime(),
      )
    }
  })

  it('debe responder 200 con actividad vacia cuando no hay registros', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(mockPersonas[0])
    vi.mocked(prisma.donacion.findMany).mockResolvedValue([])
    vi.mocked(prisma.transfusion.findMany).mockResolvedValue([])
    vi.mocked(prisma.estudioGestante.findMany).mockResolvedValue([])
    vi.mocked(prisma.recienNacido.findMany).mockResolvedValue([])

    const res = await request(app)
      .get('/api/v1/personas/1/actividad')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toEqual([])
    expect(res.body.data.total).toBe(0)
  })

  it('debe responder 404 cuando la persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/personas/999/actividad')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
  })

  it('debe responder 401 sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)
    const res = await request(app).get('/api/v1/personas/1/actividad')
    expect(res.status).toBe(401)
  })
})