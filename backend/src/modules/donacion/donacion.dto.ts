import { donacionResponseSchema } from './donacion.schema'
import type { DonacionResponse } from './donacion.schema'

export function toDonacionResponse(d: {
  id: number
  donante: {
    id: number
    personaId: number
    persona: { id: number; dni: string; nombre: string; apellido: string }
  }
  fecha: Date
  peso: number
  tensionArterial: string
  hemoglobina: number
  tipoDonacion: string
  reaccionAdversa: string | null
  resultadoSerologia: {
    id: number; hiv: boolean; hcv: boolean; hbv: boolean; chagas: boolean; sifilis: boolean
  } | null
}): DonacionResponse {
  return donacionResponseSchema.parse({
    id: d.id,
    donante: {
      id: d.donante.id,
      personaId: d.donante.personaId,
      dni: d.donante.persona.dni,
      nombre: d.donante.persona.nombre,
      apellido: d.donante.persona.apellido,
    },
    fecha: d.fecha.toISOString(),
    peso: d.peso,
    tensionArterial: d.tensionArterial,
    hemoglobina: d.hemoglobina,
    tipoDonacion: d.tipoDonacion,
    reaccionAdversa: d.reaccionAdversa,
    resultadoSerologia: d.resultadoSerologia,
  })
}
