import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'

const mockPaciente = {
  id: 1,
  personaId: 1,
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

const mockPacienteConPersona = {
  ...mockPaciente,
  persona: { id: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez' },
} as any

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: { findUnique: vi.fn() },
    persona: { findFirst: vi.fn() },
    paciente: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    transfusion: { count: vi.fn() },
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

// =========================
// GET /api/v1/pacientes
// =========================

describe('GET /api/v1/pacientes', () => {
  it('debe responder 200 con lista paginada', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findMany).mockResolvedValue([mockPacienteConPersona])
    vi.mocked(prisma.paciente.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/pacientes')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0].persona.dni).toBe('12345678')
    expect(res.body.data.total).toBe(1)
  })

  it('debe responder 200 vacío cuando no hay pacientes', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findMany).mockResolvedValue([])
    vi.mocked(prisma.paciente.count).mockResolvedValue(0)

    const res = await request(app)
      .get('/api/v1/pacientes')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(0)
    expect(res.body.data.total).toBe(0)
  })

  it('debe filtrar por dni', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findMany).mockResolvedValue([mockPacienteConPersona])
    vi.mocked(prisma.paciente.count).mockResolvedValue(1)

    const res = await request(app)
      .get('/api/v1/pacientes?dni=12345678')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body.data.items).toHaveLength(1)
    expect(vi.mocked(prisma.paciente.findMany).mock.calls[0][0]?.where?.persona?.dni).toEqual({ contains: '12345678' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .get('/api/v1/pacientes')

    expect(res.status).toBe(401)
  })
})

// =========================
// POST /api/v1/personas/:personaId/paciente
// =========================

describe('POST /api/v1/personas/:personaId/paciente', () => {
  it('debe responder 201 al crear paciente', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.paciente.create).mockResolvedValue(mockPacienteConPersona)

    const res = await request(app)
      .post('/api/v1/personas/1/paciente')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.item.persona.dni).toBe('12345678')
  })

  it('debe responder 404 cuando persona no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/personas/999/paciente')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Persona no encontrada' })
  })

  it('debe responder 409 cuando persona ya es paciente', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.persona.findFirst).mockResolvedValue({ id: 1, deletedAt: null } as any)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(mockPacienteConPersona)

    const res = await request(app)
      .post('/api/v1/personas/1/paciente')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(409)
    expect(res.body).toEqual({ success: false, error: 'La persona ya está registrada como paciente' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .post('/api/v1/personas/1/paciente')
      .send({})

    expect(res.status).toBe(401)
  })
})

// =========================
// PUT /api/v1/pacientes/:id
// =========================

describe('PUT /api/v1/pacientes/:id', () => {
  it('debe responder 200 al actualizar paciente', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(mockPacienteConPersona)

    const res = await request(app)
      .put('/api/v1/pacientes/1')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.item.persona.dni).toBe('12345678')
  })

  it('debe responder 404 cuando paciente no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/pacientes/999')
      .set('Cookie', 'session_token=valid_token')
      .send({})

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Paciente no encontrado' })
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/pacientes/1')
      .send({})

    expect(res.status).toBe(401)
  })
})

// =========================
// DELETE /api/v1/pacientes/:id
// =========================

describe('DELETE /api/v1/pacientes/:id', () => {
  it('debe responder 200 al eliminar paciente', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(mockPacienteConPersona)
    vi.mocked(prisma.transfusion.count).mockResolvedValue(0)
    vi.mocked(prisma.paciente.update).mockResolvedValue({ ...mockPacienteConPersona, deletedAt: new Date() })

    const res = await request(app)
      .delete('/api/v1/pacientes/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, data: null })
  })

  it('debe responder 404 cuando paciente no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/pacientes/999')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, error: 'Paciente no encontrado' })
  })

  it('debe responder 409 cuando tiene transfusiones activas', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockSession)
    vi.mocked(prisma.paciente.findFirst).mockResolvedValue(mockPacienteConPersona)
    vi.mocked(prisma.transfusion.count).mockResolvedValue(1)

    const res = await request(app)
      .delete('/api/v1/pacientes/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'No se puede eliminar el paciente porque tiene transfusiones activas',
    })
  })

  it('debe responder 403 para usuario no admin', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockUserSession)

    const res = await request(app)
      .delete('/api/v1/pacientes/1')
      .set('Cookie', 'session_token=valid_token')

    expect(res.status).toBe(403)
  })

  it('debe responder 401 sin autenticación', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/pacientes/1')

    expect(res.status).toBe(401)
  })
})
