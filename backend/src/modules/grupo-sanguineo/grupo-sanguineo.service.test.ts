import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as grupoSanguineoRepository from '@/modules/grupo-sanguineo/grupo-sanguineo.repository'
import { listar } from '@/modules/grupo-sanguineo/grupo-sanguineo.service'

const mockGrupos = [
  {
    id: 1,
    tipo: 'A' as const,
    factorRh: 'POSITIVO' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdById: null,
    updatedById: null,
    deletedById: null
  },
  {
    id: 2,
    tipo: 'A' as const,
    factorRh: 'NEGATIVO' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdById: null,
    updatedById: null,
    deletedById: null
  },
  {
    id: 3,
    tipo: 'B' as const,
    factorRh: 'POSITIVO' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdById: null,
    updatedById: null,
    deletedById: null
  }
]
vi.mock('@/modules/grupo-sanguineo/grupo-sanguineo.repository', () => ({
  findAllActive: vi.fn()
}))
beforeEach(() => {
  vi.clearAllMocks()
})
describe('listar', () => {
  it('debe retornar todos los grupos activos', async () => {
    vi.mocked(grupoSanguineoRepository.findAllActive).mockResolvedValue(mockGrupos)
    const result = await listar()
    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({ id: 1, tipo: 'A', factorRh: 'POSITIVO' })
  })
  it('debe retornar array vacio cuando no hay grupos', async () => {
    vi.mocked(grupoSanguineoRepository.findAllActive).mockResolvedValue([])
    const result = await listar()
    expect(result).toEqual([])
  })
  it('debe llamar a findAllActive', async () => {
    vi.mocked(grupoSanguineoRepository.findAllActive).mockResolvedValue(mockGrupos)
    await listar()
    expect(grupoSanguineoRepository.findAllActive).toHaveBeenCalledTimes(1)
  })
})
