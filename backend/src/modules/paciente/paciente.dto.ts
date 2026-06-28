import { pacienteResponseSchema } from './paciente.schema'
import type { PacienteResponse } from './paciente.schema'

export function toPacienteResponse(p: {
  id: number
  personaId: number
  createdAt: Date
  persona: {
    id: number
    dni: string
    nombre: string
    apellido: string
  }
}): PacienteResponse {
  return pacienteResponseSchema.parse({
    id: p.id,
    personaId: p.personaId,
    persona: {
      id: p.persona.id,
      dni: p.persona.dni,
      nombre: p.persona.nombre,
      apellido: p.persona.apellido,
    },
    createdAt: p.createdAt.toISOString(),
  })
}
