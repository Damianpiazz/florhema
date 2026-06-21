import { toDonacionResponse } from '@/modules/donacion/donacion.dto'
import * as donacionRepository from '@/modules/donacion/donacion.repository'
import { AppError } from '@/utils/app-error'
import type { DonacionQuery, CrearDonacionInput } from '@/modules/donacion/donacion.schema'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

export async function crear(input: CrearDonacionInput) {
  const donante = await donacionRepository.findDonanteById(input.donanteId)
  if (!donante) {
    throw new AppError(404, 'Donante no encontrado')
  }

  const serologia = input.resultadoSerologia
    ? {
        hiv: input.resultadoSerologia.hiv ?? false,
        hcv: input.resultadoSerologia.hcv ?? false,
        hbv: input.resultadoSerologia.hbv ?? false,
        chagas: input.resultadoSerologia.chagas ?? false,
        sifilis: input.resultadoSerologia.sifilis ?? false,
      }
    : null

  const donacion = await donacionRepository.create({
    donanteId: input.donanteId,
    fecha: input.fecha,
    peso: input.peso,
    tensionArterial: input.tensionArterial,
    hemoglobina: input.hemoglobina,
    tipoDonacion: input.tipoDonacion,
    reaccionAdversa: input.reaccionAdversa ?? null,
    resultadoSerologia: serologia,
  })

  return toDonacionResponse(donacion as any)
}

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
