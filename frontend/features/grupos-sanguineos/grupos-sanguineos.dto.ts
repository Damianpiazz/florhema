import { listarGruposResponseSchema } from './grupos-sanguineos.schema'
import type { GrupoSanguineo } from './grupos-sanguineos.schema'

export function parseListarGruposResponse(data: unknown): GrupoSanguineo[] {
  return listarGruposResponseSchema.parse(data).data.items
}
