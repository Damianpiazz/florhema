import { z } from 'zod'
import { EstadoEstudio, TipoCoombs } from '@/generated/prisma/enums'

export const estudioGestanteQuerySchema = z.object({
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  estadoEstudio: z.nativeEnum(EstadoEstudio).optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const pruebaCoombsIndirectaInputSchema = z.object({
  tipo: z.nativeEnum(TipoCoombs),
  positivo: z.boolean(),
})

export const crearEstudioGestanteSchema = z.object({
  fecha: z.coerce.date(),
  compatibilidadConyugal: z.string().min(1, 'La compatibilidad conyugal es requerida'),
  estadoEstudio: z.nativeEnum(EstadoEstudio).default('PENDIENTE'),
  pruebaCoombsIndirecta: pruebaCoombsIndirectaInputSchema,
})

export const actualizarEstudioGestanteSchema = z.object({
  fecha: z.coerce.date().optional(),
  compatibilidadConyugal: z.string().optional(),
  estadoEstudio: z.nativeEnum(EstadoEstudio).optional(),
  pruebaCoombsIndirecta: pruebaCoombsIndirectaInputSchema.optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe enviar al menos un campo para actualizar',
})

export const resultadoCoombsSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  positivo: z.boolean(),
})

export const estudioGestanteResponseSchema = z.object({
  id: z.number(),
  gestanteId: z.number(),
  fecha: z.date().or(z.string()),
  compatibilidadConyugal: z.string().nullable(),
  estadoEstudio: z.string(),
  pruebaCoombsIndirecta: resultadoCoombsSchema,
})

export const estudioGestanteItemResponseSchema = z.object({
  item: estudioGestanteResponseSchema,
})

export const listarEstudiosGestanteResponseSchema = z.object({
  items: z.array(estudioGestanteResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export type EstudioGestanteQuery = z.infer<typeof estudioGestanteQuerySchema>
export type CrearEstudioGestanteInput = z.infer<typeof crearEstudioGestanteSchema>
export type ActualizarEstudioGestanteInput = z.infer<typeof actualizarEstudioGestanteSchema>
export type EstudioGestanteResponse = z.infer<typeof estudioGestanteResponseSchema>
