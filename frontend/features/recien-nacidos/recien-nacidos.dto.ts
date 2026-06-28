import { z } from 'zod'
import { listarRecienNacidosResponseSchema, recienNacidoSchema } from './recien-nacidos.schema'
import type { ListarRecienNacidosResponse, RecienNacido } from './recien-nacidos.schema'

export function parseListarRecienNacidosResponse(data: unknown): ListarRecienNacidosResponse['data'] {
  return listarRecienNacidosResponseSchema.parse(data).data
}

export function parseRecienNacidoResponse(data: unknown): RecienNacido {
  const parsed = z.object({ item: recienNacidoSchema }).parse(data)
  return parsed.item
}
