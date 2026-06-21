import { listarDonacionesResponseSchema, donacionItemResponseSchema } from './donaciones.schema'
import type { Donacion, ListarDonacionesResponse } from './donaciones.schema'

export function parseDonacionResponse(data: unknown): Donacion {
  return donacionItemResponseSchema.parse(data).data.item
}

export function parseListarDonacionesResponse(data: unknown): ListarDonacionesResponse['data'] {
  return listarDonacionesResponseSchema.parse(data).data
}
