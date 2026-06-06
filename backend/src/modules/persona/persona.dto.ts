import {
  personaResponseSchema,
  personaDetalleResponseSchema,
  donacionResponseSchema,
  transfusionResponseSchema,
  estudioGestanteResponseSchema,
  recienNacidoResponseSchema,
} from './persona.schema'
import type {
  PersonaResponse,
  PersonaDetalleResponse,
  DonacionResponse,
  TransfusionResponse,
  EstudioGestanteResponse,
  RecienNacidoResponse,
} from './persona.schema'

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

// =========================
// DETALLE PERSONA
// =========================

export function toPersonaDetalleResponse(persona: {
  id: number
  dni: string
  nombre: string
  apellido: string
  fechaNacimiento: Date
  direccion: string
  telefono: string
  grupoSanguineo: { id: number; tipo: string; factorRh: string }
  donante?: { id: number; semaforoAptitud: string } | null
  paciente?: { id: number } | null
  gestante?: { id: number; antecedentesObstetricos: string | null } | null
}): PersonaDetalleResponse {
  return personaDetalleResponseSchema.parse({
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
    donante: persona.donante ?? null,
    paciente: persona.paciente ?? null,
    gestante: persona.gestante ?? null,
  })
}

// =========================
// DONACIONES
// =========================

export function toDonacionResponse(d: {
  id: number
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
    fecha: d.fecha.toISOString(),
    peso: d.peso,
    tensionArterial: d.tensionArterial,
    hemoglobina: d.hemoglobina,
    tipoDonacion: d.tipoDonacion,
    reaccionAdversa: d.reaccionAdversa,
    resultadoSerologia: d.resultadoSerologia,
  })
}

export function toDonacionActividadItem(d: {
  id: number
  fecha: Date
  peso: number
  tensionArterial: string
  hemoglobina: number
  tipoDonacion: string
  reaccionAdversa: string | null
  resultadoSerologia: {
    id: number; hiv: boolean; hcv: boolean; hbv: boolean; chagas: boolean; sifilis: boolean
  } | null
}) {
  return {
    tipo: 'DONACION' as const,
    fecha: d.fecha.toISOString(),
    id: d.id,
    peso: d.peso,
    tensionArterial: d.tensionArterial,
    hemoglobina: d.hemoglobina,
    tipoDonacion: d.tipoDonacion,
    reaccionAdversa: d.reaccionAdversa,
    resultadoSerologia: d.resultadoSerologia,
  }
}

// =========================
// TRANSFUSIONES
// =========================

export function toTransfusionResponse(t: {
  id: number
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
    fecha: t.fecha.toISOString(),
    componente: t.componente,
    cantidadUnidades: t.cantidadUnidades,
    reaccionAdversa: t.reaccionAdversa,
    compatibilidad: t.compatibilidad,
    resultadoCoombs: t.resultadoCoombs,
  })
}

export function toTransfusionActividadItem(t: {
  id: number
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
}) {
  return {
    tipo: 'TRANSFUSION' as const,
    fecha: t.fecha.toISOString(),
    id: t.id,
    componente: t.componente,
    cantidadUnidades: t.cantidadUnidades,
    reaccionAdversa: t.reaccionAdversa,
    compatibilidad: t.compatibilidad,
    resultadoCoombs: t.resultadoCoombs,
  }
}

// =========================
// ESTUDIOS GESTANTE
// =========================

export function toEstudioResponse(e: {
  id: number
  fecha: Date
  compatibilidadConyugal: string | null
  estadoEstudio: string
  pruebaCoombsIndirecta: {
    id: number; tipo: string; positivo: boolean
  } | null
}): EstudioGestanteResponse {
  return estudioGestanteResponseSchema.parse({
    id: e.id,
    fecha: e.fecha.toISOString(),
    compatibilidadConyugal: e.compatibilidadConyugal,
    estadoEstudio: e.estadoEstudio,
    pruebaCoombsIndirecta: e.pruebaCoombsIndirecta,
  })
}

export function toEstudioActividadItem(e: {
  id: number
  fecha: Date
  compatibilidadConyugal: string | null
  estadoEstudio: string
  pruebaCoombsIndirecta: {
    id: number; tipo: string; positivo: boolean
  } | null
}) {
  return {
    tipo: 'ESTUDIO_GESTANTE' as const,
    fecha: e.fecha.toISOString(),
    id: e.id,
    compatibilidadConyugal: e.compatibilidadConyugal,
    estadoEstudio: e.estadoEstudio,
    pruebaCoombsIndirecta: e.pruebaCoombsIndirecta,
  }
}

// =========================
// RECIEN NACIDOS
// =========================

export function toRecienNacidoResponse(r: {
  id: number
  personaId: number
  pruebaCoombsDirecta: {
    id: number; tipo: string; positivo: boolean
  } | null
}): RecienNacidoResponse {
  return recienNacidoResponseSchema.parse({
    id: r.id,
    personaId: r.personaId,
    pruebaCoombsDirecta: r.pruebaCoombsDirecta,
  })
}

export function toRecienNacidoActividadItem(r: {
  id: number
  createdAt: Date
  personaId: number
  pruebaCoombsDirecta: {
    id: number; tipo: string; positivo: boolean
  } | null
}) {
  return {
    tipo: 'RECIEN_NACIDO' as const,
    fecha: r.createdAt.toISOString(),
    id: r.id,
    personaId: r.personaId,
    pruebaCoombsDirecta: r.pruebaCoombsDirecta,
  }
}