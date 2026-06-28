import { listarGestantesResponseSchema } from './gestantes.schema'
import type { ListarGestantesResponse } from './gestantes.schema'

export function parseListarGestantesResponse(data: unknown): ListarGestantesResponse['data'] {
  return listarGestantesResponseSchema.parse(data).data
}
