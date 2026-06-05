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
  createdById: 1,
  updatedById: null,
  deletedById: null,
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
  createdById: null,
  updatedById: 1,
  deletedById: null,
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
      createdById: null,
      updatedById: null,
      deletedById: null,
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
      createdById: null,
      updatedById: null,
      deletedById: null,
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