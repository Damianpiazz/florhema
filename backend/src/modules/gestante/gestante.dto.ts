import { gestanteResponseSchema } from './gestante.schema'
import type { GestanteResponse } from './gestante.schema'

export function toGestanteResponse(g: {
  id: number
  personaId: number
  antecedentesObstetricos: string | null
  createdAt: Date
  persona: {
    id: number
    dni: string
    nombre: string
    apellido: string
  }
}): GestanteResponse {
  return gestanteResponseSchema.parse({
    id: g.id,
    personaId: g.personaId,
    persona: {
      id: g.persona.id,
      dni: g.persona.dni,
      nombre: g.persona.nombre,
      apellido: g.persona.apellido,
    },
    antecedentesObstetricos: g.antecedentesObstetricos,
    createdAt: g.createdAt.toISOString(),
  })
}
