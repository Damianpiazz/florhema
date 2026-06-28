import { prisma } from '@/lib/prisma'
import { AppError } from '@/utils/app-error'
import * as estudioGestanteRepository from '@/modules/estudio-gestante/estudio-gestante.repository'
import { toEstudioGestanteResponse } from '@/modules/estudio-gestante/estudio-gestante.dto'
import type { EstudioGestanteQuery, CrearEstudioGestanteInput, ActualizarEstudioGestanteInput } from '@/modules/estudio-gestante/estudio-gestante.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(gestanteId: number, params: EstudioGestanteQuery) {
  const gestante = await estudioGestanteRepository.findGestanteById(gestanteId)
  if (!gestante) {
    throw new AppError(404, 'Gestante no encontrada')
  }

  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    estudioGestanteRepository.findAllByGestanteId(gestanteId, {
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      estadoEstudio: params.estadoEstudio,
      limit,
      offset,
    }),
    estudioGestanteRepository.countByGestanteId(gestanteId, {
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      estadoEstudio: params.estadoEstudio,
    }),
  ])

  return {
    items: (items as any[]).map(toEstudioGestanteResponse),
    total,
    limit,
    offset,
  }
}

export async function listarTodos(params: EstudioGestanteQuery) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    estudioGestanteRepository.findAll({
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      estadoEstudio: params.estadoEstudio,
      limit,
      offset,
    }),
    estudioGestanteRepository.countAll({
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      estadoEstudio: params.estadoEstudio,
    }),
  ])

  return {
    items: (items as any[]).map(toEstudioGestanteResponse),
    total,
    limit,
    offset,
  }
}

export async function crear(gestanteId: number, input: CrearEstudioGestanteInput) {
  const gestante = await estudioGestanteRepository.findGestanteById(gestanteId)
  if (!gestante) {
    throw new AppError(404, 'Gestante no encontrada')
  }

  const estudio = await prisma.$transaction(async (tx) => {
    const resultadoCoombs = await tx.resultadoCoombs.create({
      data: {
        tipo: input.pruebaCoombsIndirecta.tipo as any,
        positivo: input.pruebaCoombsIndirecta.positivo,
      },
    })

    return tx.estudioGestante.create({
      data: {
        gestanteId,
        fecha: input.fecha,
        compatibilidadConyugal: input.compatibilidadConyugal,
        estadoEstudio: input.estadoEstudio as any,
        pruebaCoombsIndirectaId: resultadoCoombs.id,
      },
      include: {
        pruebaCoombsIndirecta: true,
      },
    })
  })

  return toEstudioGestanteResponse(estudio as any)
}

export async function obtener(id: number) {
  const estudio = await estudioGestanteRepository.findById(id)
  if (!estudio) {
    throw new AppError(404, 'Estudio no encontrado')
  }
  return toEstudioGestanteResponse(estudio as any)
}

export async function actualizar(id: number, input: ActualizarEstudioGestanteInput) {
  const existente = await estudioGestanteRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Estudio no encontrado')
  }

  const estudio = await prisma.$transaction(async (tx) => {
    if (input.pruebaCoombsIndirecta) {
      await tx.resultadoCoombs.update({
        where: { id: (existente as any).pruebaCoombsIndirecta.id },
        data: {
          tipo: input.pruebaCoombsIndirecta.tipo as any,
          positivo: input.pruebaCoombsIndirecta.positivo,
        },
      })
    }

    const updateData: any = {}
    if (input.fecha) updateData.fecha = input.fecha
    if (input.compatibilidadConyugal !== undefined) updateData.compatibilidadConyugal = input.compatibilidadConyugal
    if (input.estadoEstudio) updateData.estadoEstudio = input.estadoEstudio as any

    return tx.estudioGestante.update({
      where: { id },
      data: updateData,
      include: {
        pruebaCoombsIndirecta: true,
      },
    })
  })

  return toEstudioGestanteResponse(estudio as any)
}

export async function eliminar(id: number) {
  const existente = await estudioGestanteRepository.findById(id)
  if (!existente) {
    throw new AppError(404, 'Estudio no encontrado')
  }

  await prisma.$transaction(async (tx) => {
    await tx.estudioGestante.update({
      where: { id },
      data: { deletedAt: new Date() },
    })

    const coombsId = (existente as any).pruebaCoombsIndirecta.id
    await tx.resultadoCoombs.update({
      where: { id: coombsId },
      data: { deletedAt: new Date() },
    })
  })
}
