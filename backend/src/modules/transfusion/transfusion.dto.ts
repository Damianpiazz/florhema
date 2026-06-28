import { transfusionResponseSchema } from './transfusion.schema'
import type { TransfusionResponse } from './transfusion.schema'

export function toTransfusionResponse(t: {
  id: number
  paciente: {
    id: number
    personaId: number
    persona: { id: number; dni: string; nombre: string; apellido: string }
  }
  fecha: Date
  componente: string
  cantidadUnidades: number
  reaccionAdversa: string | null
  compatibilidad: {
    id: number; compatible: boolean; motivoIncompatibilidad: string | null
    donanteGrupo: { id: number; tipo: string; factorRh: string }
    receptorGrupo: { id: number; tipo: string; factorRh: string }
  } | null
  resultadoCoombs: {
    id: number; tipo: string; positivo: boolean
  } | null
}): TransfusionResponse {
  return transfusionResponseSchema.parse({
    id: t.id,
    paciente: {
      id: t.paciente.id,
      personaId: t.paciente.personaId,
      nombre: t.paciente.persona.nombre,
      apellido: t.paciente.persona.apellido,
      dni: t.paciente.persona.dni,
    },
    fecha: t.fecha.toISOString(),
    componente: t.componente,
    cantidadUnidades: t.cantidadUnidades,
    reaccionAdversa: t.reaccionAdversa,
    compatibilidad: t.compatibilidad,
    resultadoCoombs: t.resultadoCoombs,
  })
}
