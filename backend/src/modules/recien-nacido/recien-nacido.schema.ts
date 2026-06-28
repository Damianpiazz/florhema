import { z } from 'zod'

export const pruebaCoombsDirectaInputSchema = z.object({
  tipo: z.literal('DIRECTO'),
  positivo: z.boolean(),
})

export const crearRecienNacidoSchema = z.object({
  dni: z.string().min(7).max(10),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  fechaNacimiento: z.coerce.date(),
  direccion: z.string().min(1),
  telefono: z.string().min(1),
  grupoSanguineoId: z.number().int().positive(),
  pruebaCoombsDirecta: pruebaCoombsDirectaInputSchema,
})

export const actualizarRecienNacidoSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  direccion: z.string().min(1).optional(),
  telefono: z.string().min(1).optional(),
  grupoSanguineoId: z.number().int().positive().optional(),
  pruebaCoombsDirecta: pruebaCoombsDirectaInputSchema.optional(),
})

export const recienNacidoPersonaEmbebidaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  fechaNacimiento: z.date().or(z.string()),
})

export const resultadoCoombsEmbebidoSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  positivo: z.boolean(),
})

export const recienNacidoResponseSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  gestanteId: z.number(),
  persona: recienNacidoPersonaEmbebidaSchema,
  pruebaCoombsDirecta: resultadoCoombsEmbebidoSchema.nullable(),
  createdAt: z.date().or(z.string()),
})

export const listarRecienNacidosResponseSchema = z.object({
  items: z.array(recienNacidoResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const recienNacidoItemResponseSchema = z.object({
  item: recienNacidoResponseSchema,
})

export type CrearRecienNacidoInput = z.infer<typeof crearRecienNacidoSchema>
export type ActualizarRecienNacidoInput = z.infer<typeof actualizarRecienNacidoSchema>
export type RecienNacidoResponse = z.infer<typeof recienNacidoResponseSchema>
