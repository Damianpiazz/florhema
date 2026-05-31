import { personaResponseSchema } from './persona.schema'
import type { PersonaResponse } from './persona.schema'

export function toPersonaResponse(persona: {
  id: number
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: Date
  direccion: string
  telefono: string
  grupoSanguineo: { id: number; tipo: string; factorRh: string }
}): PersonaResponse {
  return personaResponseSchema.parse({
    id: persona.id,
    dni: persona.dni,
    nombre: persona.nombre,
    apellido: persona.apellido,
    fechaNacimiento: persona.fechaNacimiento.toISOString(),
    direccion: persona.direccion,
    telefono: persona.telefono,
    grupoSanguineo: {
      id: persona.grupoSanguineo.id,
      tipo: persona.grupoSanguineo.tipo,
      factorRh: persona.grupoSanguineo.factorRh,
    },
  })
}