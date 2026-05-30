import { grupoSanguineoResponseSchema } from './grupo-sanguineo.schema'
import type { GrupoSanguineoResponse } from './grupo-sanguineo.schema'

export function toGrupoSanguineoResponse(grupo: {
  id: number
  tipo: string
  factorRh: string
}): GrupoSanguineoResponse {
  return grupoSanguineoResponseSchema.parse({
    id: grupo.id,
    tipo: grupo.tipo,
    factorRh: grupo.factorRh
  })
}

export function toGrupoSanguineoItemResponse(grupo: {
  id: number
  tipo: string
  factorRh: string
}) {
  return { item: toGrupoSanguineoResponse(grupo) }
}
