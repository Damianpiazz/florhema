import { recienNacidoResponseSchema } from './recien-nacido.schema'
import type { RecienNacidoResponse } from './recien-nacido.schema'

export function toRecienNacidoResponse(r: {
  id: number
  personaId: number
  gestanteId: number
  persona: {
    id: number
    dni: string
    nombre: string
    apellido: string
    fechaNacimiento: Date
  }
  pruebaCoombsDirecta: {
    id: number
    tipo: string
    positivo: boolean
  } | null
  createdAt: Date
}): RecienNacidoResponse {
  return recienNacidoResponseSchema.parse({
    id: r.id,
    personaId: r.personaId,
    gestanteId: r.gestanteId,
    persona: {
      id: r.persona.id,
      dni: r.persona.dni,
      nombre: r.persona.nombre,
      apellido: r.persona.apellido,
      fechaNacimiento: r.persona.fechaNacimiento,
    },
    pruebaCoombsDirecta: r.pruebaCoombsDirecta,
    createdAt: r.createdAt,
  })
}
