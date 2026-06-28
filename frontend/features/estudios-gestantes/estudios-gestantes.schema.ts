import { z } from 'zod'

export const resultadoCoombsSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  positivo: z.boolean(),
})

export const estudioGestanteSchema = z.object({
  id: z.number(),
  gestanteId: z.number(),
  fecha: z.string(),
  compatibilidadConyugal: z.string().nullable(),
  estadoEstudio: z.string(),
  pruebaCoombsIndirecta: resultadoCoombsSchema.nullable(),
})

export const estudioGestanteItemResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: estudioGestanteSchema,
  }),
})

export const listarEstudiosGestanteResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(estudioGestanteSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
})

export const pruebaCoombsIndirectaInputSchema = z.object({
  tipo: z.literal('INDIRECTO'),
  positivo: z.boolean(),
})

export const crearEstudioGestanteInputSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  compatibilidadConyugal: z.string().min(1, 'La compatibilidad conyugal es requerida'),
  estadoEstudio: z.enum(['PENDIENTE', 'FINALIZADO'], {
    message: 'El estado es requerido',
  }),
  pruebaCoombsIndirecta: pruebaCoombsIndirectaInputSchema,
})

export const actualizarEstudioGestanteInputSchema = z.object({
  fecha: z.string().optional(),
  compatibilidadConyugal: z.string().optional(),
  estadoEstudio: z.enum(['PENDIENTE', 'FINALIZADO']).optional(),
  pruebaCoombsIndirecta: pruebaCoombsIndirectaInputSchema.optional(),
})

export type EstudioGestante = z.infer<typeof estudioGestanteSchema>
export type ListarEstudiosGestanteResponse = z.infer<typeof listarEstudiosGestanteResponseSchema>
export type CrearEstudioGestanteInput = z.infer<typeof crearEstudioGestanteInputSchema>
export type ActualizarEstudioGestanteInput = z.infer<typeof actualizarEstudioGestanteInputSchema>
