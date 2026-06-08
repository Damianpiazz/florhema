import { listarDonantesResponseSchema, donanteItemResponseSchema } from './donantes.schema'
import type { Donante, ListarDonantesResponse } from './donantes.schema'

export function parseDonanteResponse(data: unknown): Donante {
  return donanteItemResponseSchema.parse(data).data.item
}

export function parseListarDonantesResponse(data: unknown): ListarDonantesResponse['data'] {
  return listarDonantesResponseSchema.parse(data).data
}
