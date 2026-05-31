import { listarPersonasResponseSchema, personaItemResponseSchema } from './personas.schema'
import type { Persona, ListarPersonasResponse } from './personas.schema'

export function parsePersonaResponse(data: unknown): Persona {
  return personaItemResponseSchema.parse(data).data.item
}

export function parseListarPersonasResponse(data: unknown): ListarPersonasResponse['data'] {
  return listarPersonasResponseSchema.parse(data).data
}