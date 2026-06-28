import { estudioGestanteItemResponseSchema, listarEstudiosGestanteResponseSchema } from './estudios-gestantes.schema'
import type { EstudioGestante, ListarEstudiosGestanteResponse } from './estudios-gestantes.schema'

export function parseEstudioGestanteResponse(data: unknown): EstudioGestante {
  return estudioGestanteItemResponseSchema.parse(data).data.item
}

export function parseListarEstudiosGestanteResponse(data: unknown): ListarEstudiosGestanteResponse['data'] {
  return listarEstudiosGestanteResponseSchema.parse(data).data
}
