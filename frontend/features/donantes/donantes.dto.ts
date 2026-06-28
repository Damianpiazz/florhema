import { listarDonantesResponseSchema, donanteItemResponseSchema, calcularSemaforoResponseSchema } from './donantes.schema'
import type { Donante, ListarDonantesResponse, CalcularSemaforoResponse } from './donantes.schema'

export function parseDonanteResponse(data: unknown): Donante {
  return donanteItemResponseSchema.parse(data).data.item
}

export function parseListarDonantesResponse(data: unknown): ListarDonantesResponse['data'] {
  return listarDonantesResponseSchema.parse(data).data
}

export function parseCalcularSemaforoResponse(data: unknown): CalcularSemaforoResponse['data'] {
  return calcularSemaforoResponseSchema.parse(data).data
}
