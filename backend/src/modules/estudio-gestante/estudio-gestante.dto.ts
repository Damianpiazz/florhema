import { estudioGestanteResponseSchema } from './estudio-gestante.schema'
import type { EstudioGestanteResponse } from './estudio-gestante.schema'

export function toEstudioGestanteResponse(e: {
  id: number
  gestanteId: number
  fecha: Date
  compatibilidadConyugal: string | null
  estadoEstudio: string
  pruebaCoombsIndirecta: {
    id: number
    tipo: string
    positivo: boolean
  }
}): EstudioGestanteResponse {
  return estudioGestanteResponseSchema.parse({
    id: e.id,
    gestanteId: e.gestanteId,
    fecha: e.fecha.toISOString(),
    compatibilidadConyugal: e.compatibilidadConyugal,
    estadoEstudio: e.estadoEstudio,
    pruebaCoombsIndirecta: e.pruebaCoombsIndirecta,
  })
}
