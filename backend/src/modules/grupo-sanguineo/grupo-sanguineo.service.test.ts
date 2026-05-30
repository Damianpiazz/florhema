import { describe, it, expect, vi, beforeEach } from 'vitest'

import type { $Enums } from '@/generated/prisma/client'
import * as grupoSanguineoRepository from '@/modules/grupo-sanguineo/grupo-sanguineo.repository'
import { listar, actualizar, eliminar } from '@/modules/grupo-sanguineo/grupo-sanguineo.service'

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
  },
  {
    id: 3,
    tipo: 'B' as $Enums.TipoABO,
    factorRh: 'POSITIVO' as $Enums.FactorRh,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    createdById: null,
    updatedById: null,
    deletedById: null
  }
]

const mockGrupo = {
  id: 1,
  tipo: 'A' as $Enums.TipoABO,
  factorRh: 'POSITIVO' as $Enums.FactorRh,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdById: null,
  updatedById: null,
  deletedById: null
}

const mockUpdatedGrupo = {
  id: 1,
  tipo: 'AB' as $Enums.TipoABO,
  factorRh: 'NEGATIVO' as $Enums.FactorRh,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdById: null,
  updatedById: 1,
  deletedById: null
}

vi.mock('@/modules/grupo-sanguineo/grupo-sanguineo.repository', () => ({
  findAllActive: vi.fn(),
  findById: vi.fn(),
  findByTipoFactorRh: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  countPersonasVinculadas: vi.fn()
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

describe('actualizar', () => {
  it('debe actualizar y retornar item cuando los datos son validos', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(mockGrupo)
    vi.mocked(grupoSanguineoRepository.findByTipoFactorRh).mockResolvedValue(null)
    vi.mocked(grupoSanguineoRepository.update).mockResolvedValue(mockUpdatedGrupo)

    const result = await actualizar(1, { tipo: 'AB', factorRh: 'NEGATIVO' }, 1)

    expect(result).toEqual({
      item: { id: 1, tipo: 'AB', factorRh: 'NEGATIVO' }
    })
    expect(grupoSanguineoRepository.findById).toHaveBeenCalledWith(1)
    expect(grupoSanguineoRepository.findByTipoFactorRh).toHaveBeenCalledWith('AB', 'NEGATIVO', 1)
    expect(grupoSanguineoRepository.update).toHaveBeenCalledWith(
      1,
      { tipo: 'AB', factorRh: 'NEGATIVO' },
      1
    )
  })

  it('debe lanzar AppError 404 cuando el grupo no existe', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(null)

    await expect(actualizar(999, { tipo: 'AB', factorRh: 'NEGATIVO' }, 1)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe lanzar AppError 404 cuando el grupo esta soft-deleted', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue({
      ...mockGrupo,
      deletedAt: new Date()
    })

    await expect(actualizar(1, { tipo: 'AB', factorRh: 'NEGATIVO' }, 1)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe lanzar AppError 409 cuando la combinacion ya existe', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(mockGrupo)
    vi.mocked(grupoSanguineoRepository.findByTipoFactorRh).mockResolvedValue({
      id: 5,
      tipo: 'AB' as $Enums.TipoABO,
      factorRh: 'NEGATIVO' as $Enums.FactorRh,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdById: null,
      updatedById: null,
      deletedById: null
    })

    await expect(actualizar(1, { tipo: 'AB', factorRh: 'NEGATIVO' }, 1)).rejects.toMatchObject({
      statusCode: 409,
      message: 'Ya existe un grupo con esa combinación de tipo y factor Rh'
    })
  })

  it('debe llamar a update con updatedById', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(mockGrupo)
    vi.mocked(grupoSanguineoRepository.findByTipoFactorRh).mockResolvedValue(null)
    vi.mocked(grupoSanguineoRepository.update).mockResolvedValue(mockUpdatedGrupo)

    await actualizar(1, { tipo: 'AB', factorRh: 'NEGATIVO' }, 42)

    expect(grupoSanguineoRepository.update).toHaveBeenCalledWith(
      1,
      { tipo: 'AB', factorRh: 'NEGATIVO' },
      42
    )
  })
})

describe('eliminar', () => {
  it('debe eliminar y retornar mensaje de exito', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(mockGrupo)
    vi.mocked(grupoSanguineoRepository.countPersonasVinculadas).mockResolvedValue(0)
    vi.mocked(grupoSanguineoRepository.softDelete).mockResolvedValue({
      ...mockGrupo,
      deletedAt: new Date(),
      deletedById: 1
    })

    const result = await eliminar(1, 1)

    expect(result).toEqual({ message: 'Grupo sanguíneo eliminado correctamente' })
    expect(grupoSanguineoRepository.findById).toHaveBeenCalledWith(1)
    expect(grupoSanguineoRepository.countPersonasVinculadas).toHaveBeenCalledWith(1)
    expect(grupoSanguineoRepository.softDelete).toHaveBeenCalledWith(1, 1)
  })

  it('debe lanzar AppError 404 cuando el grupo no existe', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(null)

    await expect(eliminar(999, 1)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe lanzar AppError 404 cuando el grupo esta soft-deleted', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue({
      ...mockGrupo,
      deletedAt: new Date()
    })

    await expect(eliminar(1, 1)).rejects.toMatchObject({
      statusCode: 404,
      message: 'Grupo sanguíneo no encontrado'
    })
  })

  it('debe lanzar AppError 409 cuando tiene personas vinculadas', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(mockGrupo)
    vi.mocked(grupoSanguineoRepository.countPersonasVinculadas).mockResolvedValue(3)

    await expect(eliminar(1, 1)).rejects.toMatchObject({
      statusCode: 409,
      message: 'No se puede eliminar el grupo porque tiene personas asociadas'
    })
  })

  it('debe llamar a softDelete con deletedById correcto', async () => {
    vi.mocked(grupoSanguineoRepository.findById).mockResolvedValue(mockGrupo)
    vi.mocked(grupoSanguineoRepository.countPersonasVinculadas).mockResolvedValue(0)
    vi.mocked(grupoSanguineoRepository.softDelete).mockResolvedValue({
      ...mockGrupo,
      deletedAt: new Date(),
      deletedById: 42
    })

    await eliminar(1, 42)

    expect(grupoSanguineoRepository.softDelete).toHaveBeenCalledWith(1, 42)
  })
})
