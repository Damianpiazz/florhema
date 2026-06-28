import { z } from 'zod'

export const crearGestanteSchema = z.object({
  antecedentesObstetricos: z.string().nullable().optional(),
})

export const actualizarGestanteSchema = z.object({
  antecedentesObstetricos: z.string().nullable().optional(),
}).refine(data => data.antecedentesObstetricos !== undefined, {
  message: 'Debe enviar al menos un campo para actualizar',
})

export const gestanteQuerySchema = z.object({
  dni: z.string().optional(),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const gestantePersonaEmbebidaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
})

export const gestanteResponseSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  persona: gestantePersonaEmbebidaSchema,
  antecedentesObstetricos: z.string().nullable(),
  createdAt: z.date().or(z.string()),
})

export const listarGestantesResponseSchema = z.object({
  items: z.array(gestanteResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const gestanteItemResponseSchema = z.object({
  item: gestanteResponseSchema,
})

export type CrearGestanteInput = z.infer<typeof crearGestanteSchema>
export type ActualizarGestanteInput = z.infer<typeof actualizarGestanteSchema>
export type GestanteQuery = z.infer<typeof gestanteQuerySchema>
export type GestanteResponse = z.infer<typeof gestanteResponseSchema>
