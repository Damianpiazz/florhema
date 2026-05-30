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
    createdById: null,
    updatedById: null,
    deletedById: null
  },
  {
    id: 2,
    tipo: 'A' as $Enums.TipoABO,
    factorRh: 'NEGATIVO' as $Enums.FactorRh,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdById: null,
    updatedById: null,
    deletedById: null
  }
]
vi.mock('@/lib/prisma', () => ({
  prisma: {
    grupoSanguineo: {
      findMany: vi.fn()
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
