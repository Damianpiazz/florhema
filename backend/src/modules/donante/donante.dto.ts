import { donanteResponseSchema } from './donante.schema'
import type { DonanteResponse } from './donante.schema'

export function toDonanteResponse(donante: {
  id: number
  personaId: number
  persona: { id: number; dni: string; nombre: string; apellido: string }
  semaforoAptitud: string
  createdAt: Date
}): DonanteResponse {
  return donanteResponseSchema.parse({
    id: donante.id,
    personaId: donante.personaId,
    persona: {
      id: donante.persona.id,
      dni: donante.persona.dni,
      nombre: donante.persona.nombre,
      apellido: donante.persona.apellido,
    },
    semaforoAptitud: donante.semaforoAptitud,
    createdAt: donante.createdAt.toISOString(),
  })
}
