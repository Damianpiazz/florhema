import {
  listarGruposResponseSchema,
  grupoItemResponseSchema,
  eliminarGrupoResponseSchema,
} from './grupos-sanguineos.schema'
import type { GrupoSanguineo } from './grupos-sanguineos.schema'

export function parseListarGruposResponse(data: unknown): GrupoSanguineo[] {
  return listarGruposResponseSchema.parse(data).data.items
}

export function parseGrupoItemResponse(data: unknown): GrupoSanguineo {
  return grupoItemResponseSchema.parse(data).data.item
}

export function parseEliminarGrupoResponse(data: unknown): void {
  eliminarGrupoResponseSchema.parse(data)
}
