import { toDonacionResponse } from '@/modules/donacion/donacion.dto'
import * as donacionRepository from '@/modules/donacion/donacion.repository'
import { AppError } from '@/utils/app-error'
import type { DonacionQuery } from '@/modules/donacion/donacion.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: DonacionQuery) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    donacionRepository.findAll({
      donanteId: params.donanteId,
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      tipoDonacion: params.tipoDonacion,
      limit,
      offset,
    }),
    donacionRepository.count({
      donanteId: params.donanteId,
      fechaDesde: params.fechaDesde,
      fechaHasta: params.fechaHasta,
      tipoDonacion: params.tipoDonacion,
    }),
  ])

  return {
    items: (items as any[]).map(toDonacionResponse),
    total,
    limit,
    offset,
  }
}

export async function obtener(id: number) {
  const donacion = await donacionRepository.findById(id)
  if (!donacion) {
    throw new AppError(404, 'Donación no encontrada')
  }
  return toDonacionResponse(donacion as any)
}
