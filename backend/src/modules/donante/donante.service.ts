import { toDonanteResponse } from '@/modules/donante/donante.dto'
import * as donanteRepository from '@/modules/donante/donante.repository'
import { AppError } from '@/utils/app-error'
import type { DonanteQuery } from '@/modules/donante/donante.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function listar(params: DonanteQuery) {
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT)
  const offset = params.offset ?? 0

  const [items, total] = await Promise.all([
    donanteRepository.findAll({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
      semaforoAptitud: params.semaforoAptitud,
      limit,
      offset,
    }),
    donanteRepository.count({
      dni: params.dni,
      nombre: params.nombre,
      apellido: params.apellido,
      semaforoAptitud: params.semaforoAptitud,
    }),
  ])

  return {
    items: (items as any[]).map(toDonanteResponse),
    total,
    limit,
    offset,
  }
}

export async function obtener(id: number) {
  const donante = await donanteRepository.findById(id)
  if (!donante) {
    throw new AppError(404, 'Donante no encontrado')
  }
  return toDonanteResponse(donante as any)
}
