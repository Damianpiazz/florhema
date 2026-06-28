import { z } from 'zod'

export const donanteQuerySchema = z.object({
  dni: z.string().optional(),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  semaforoAptitud: z.enum(['VERDE', 'AMARILLO', 'ROJO']).optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const donantePersonaEmbebidaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
})

export const donanteResponseSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  persona: donantePersonaEmbebidaSchema,
  semaforoAptitud: z.string(),
  createdAt: z.date().or(z.string()),
})

export const listarDonantesResponseSchema = z.object({
  items: z.array(donanteResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const donanteItemResponseSchema = z.object({
  item: donanteResponseSchema,
})

export const calcularSemaforoResponseSchema = z.object({
  semaforoAptitud: z.enum(['VERDE', 'AMARILLO', 'ROJO']),
  motivo: z.string(),
})

export type CalcularSemaforoResponse = z.infer<typeof calcularSemaforoResponseSchema>
export type DonanteResponse = z.infer<typeof donanteResponseSchema>
export type DonanteQuery = z.infer<typeof donanteQuerySchema>
