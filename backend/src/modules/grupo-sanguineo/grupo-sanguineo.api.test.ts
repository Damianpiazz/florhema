import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import app from '@/app'
import type { $Enums } from '@/generated/prisma/client'

const mockGrupos = [
  {
    id: 1,
    tipo: 'A' as $Enums.TipoABO,
    factorRh: 'POSITIVO' as $Enums.FactorRh,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
  {
    id: 2,
    tipo: 'A' as $Enums.TipoABO,
    factorRh: 'NEGATIVO' as $Enums.FactorRh,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }
]

const mockAdminSession = {
  id: 1,
  userId: 1,
  tokenHash: 'admin_token_hash',
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 86400000),
  revokedAt: null,
  user: {
    id: 1,
    email: 'admin@hospital.com',
    name: 'Admin',
    role: 'ADMIN' as const
  }
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
    role: 'USER' as const
  }
}

const mockGrupo = {
  id: 1,
  tipo: 'A' as $Enums.TipoABO,
  factorRh: 'POSITIVO' as $Enums.FactorRh,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

const mockUpdatedGrupo = {
  id: 1,
  tipo: 'AB' as $Enums.TipoABO,
  factorRh: 'NEGATIVO' as $Enums.FactorRh,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

vi.mock('@/lib/prisma', () => ({
  prisma: {
    session: {
      findUnique: vi.fn()
    },
    grupoSanguineo: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn()
    },
    persona: {
      count: vi.fn()
    }
  }
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('GET /api/v1/grupos-sanguineos', () => {
  it('debe responder 200 con la lista de grupos', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.grupoSanguineo.findMany).mockResolvedValue(mockGrupos)

    const res = await request(app).get('/api/v1/grupos-sanguineos')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        items: [
          { id: 1, tipo: 'A', factorRh: 'POSITIVO' },
          { id: 2, tipo: 'A', factorRh: 'NEGATIVO' }
        ]
      }
    })
  })

  it('debe responder 200 con items vacio cuando no hay grupos', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.grupoSanguineo.findMany).mockResolvedValue([])

    const res = await request(app).get('/api/v1/grupos-sanguineos')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: { items: [] }
    })
  })

  it('debe ser accesible sin autenticacion', async () => {
    const { prisma } = await import('@/lib/prisma')
    vi.mocked(prisma.grupoSanguineo.findMany).mockResolvedValue([])

    const res = await request(app).get('/api/v1/grupos-sanguineos')

    expect(res.status).toBe(200)
  })
})

describe('PUT /api/v1/grupos-sanguineos/:id', () => {
  it('debe responder 200 cuando ADMIN actualiza un grupo', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(mockGrupo)
    vi.mocked(prisma.grupoSanguineo.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.grupoSanguineo.update).mockResolvedValue(mockUpdatedGrupo)

    const res = await request(app)
      .put('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=admin_valid_token')
      .send({ tipo: 'AB', factorRh: 'NEGATIVO' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: {
        item: { id: 1, tipo: 'AB', factorRh: 'NEGATIVO' }
      }
    })
    expect(prisma.grupoSanguineo.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(prisma.grupoSanguineo.findFirst).toHaveBeenCalled()
    expect(prisma.grupoSanguineo.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { tipo: 'AB', factorRh: 'NEGATIVO' }
    })
  })

  it('debe responder 404 cuando el grupo no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/grupos-sanguineos/999')
      .set('Cookie', 'session_token=admin_valid_token')
      .send({ tipo: 'AB', factorRh: 'NEGATIVO' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe responder 404 cuando el grupo esta soft-deleted', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue({
      ...mockGrupo,
      deletedAt: new Date()
    })

    const res = await request(app)
      .put('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=admin_valid_token')
      .send({ tipo: 'AB', factorRh: 'NEGATIVO' })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe responder 409 cuando la combinacion ya existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(mockGrupo)
    vi.mocked(prisma.grupoSanguineo.findFirst).mockResolvedValue({
      id: 5,
      tipo: 'AB' as $Enums.TipoABO,
      factorRh: 'NEGATIVO' as $Enums.FactorRh,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const res = await request(app)
      .put('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=admin_valid_token')
      .send({ tipo: 'AB', factorRh: 'NEGATIVO' })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'Ya existe un grupo con esa combinación de tipo y factor Rh'
    })
  })

  it('debe responder 400 cuando el body es invalido', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)

    const res = await request(app)
      .put('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=admin_valid_token')
      .send({ tipo: 'INVALIDO', factorRh: 'POSITIVO' })

    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('debe responder 403 cuando el usuario no es ADMIN', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockUserSession)

    const res = await request(app)
      .put('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=user_valid_token')
      .send({ tipo: 'AB', factorRh: 'NEGATIVO' })

    expect(res.status).toBe(403)
    expect(res.body).toEqual({
      success: false,
      error: 'Acción no permitida. Se requiere rol ADMIN'
    })
  })

  it('debe responder 401 cuando no hay sesion', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .put('/api/v1/grupos-sanguineos/1')
      .send({ tipo: 'AB', factorRh: 'NEGATIVO' })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'No autenticado'
    })
  })
})

describe('DELETE /api/v1/grupos-sanguineos/:id', () => {
  it('debe responder 200 cuando ADMIN elimina un grupo', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(mockGrupo)
    vi.mocked(prisma.persona.count).mockResolvedValue(0)
    vi.mocked(prisma.grupoSanguineo.update).mockResolvedValue({
      ...mockGrupo,
      deletedAt: new Date(),
    })

    const res = await request(app)
      .delete('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=admin_valid_token')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      success: true,
      data: { message: 'Grupo sanguíneo eliminado correctamente' }
    })
    expect(prisma.grupoSanguineo.findUnique).toHaveBeenCalledWith({ where: { id: 1 } })
    expect(prisma.persona.count).toHaveBeenCalledWith({
      where: { grupoSanguineoId: 1, deletedAt: null }
    })
    expect(prisma.grupoSanguineo.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { deletedAt: expect.any(Date) }
    })
  })

  it('debe responder 404 cuando el grupo no existe', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/v1/grupos-sanguineos/999')
      .set('Cookie', 'session_token=admin_valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe responder 404 cuando el grupo esta soft-deleted', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue({
      ...mockGrupo,
      deletedAt: new Date()
    })

    const res = await request(app)
      .delete('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=admin_valid_token')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({
      success: false,
      error: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe responder 409 cuando el grupo tiene personas vinculadas', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockAdminSession)
    vi.mocked(prisma.grupoSanguineo.findUnique).mockResolvedValue(mockGrupo)
    vi.mocked(prisma.persona.count).mockResolvedValue(3)

    const res = await request(app)
      .delete('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=admin_valid_token')

    expect(res.status).toBe(409)
    expect(res.body).toEqual({
      success: false,
      error: 'No se puede eliminar el grupo porque tiene personas asociadas'
    })
  })

  it('debe responder 403 cuando el usuario no es ADMIN', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(mockUserSession)

    const res = await request(app)
      .delete('/api/v1/grupos-sanguineos/1')
      .set('Cookie', 'session_token=user_valid_token')

    expect(res.status).toBe(403)
    expect(res.body).toEqual({
      success: false,
      error: 'Acción no permitida. Se requiere rol ADMIN'
    })
  })

  it('debe responder 401 cuando no hay sesion', async () => {
    const { prisma } = await import('@/lib/prisma')

    vi.mocked(prisma.session.findUnique).mockResolvedValue(null)

    const res = await request(app).delete('/api/v1/grupos-sanguineos/1')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      success: false,
      error: 'No autenticado'
    })
  })
})
