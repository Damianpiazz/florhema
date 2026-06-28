import { z } from 'zod'

export const crearPacienteSchema = z.object({})

export const actualizarPacienteSchema = z.object({})

export const pacienteQuerySchema = z.object({
  dni: z.string().optional(),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const pacientePersonaEmbebidaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
})

export const pacienteResponseSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  persona: pacientePersonaEmbebidaSchema,
  createdAt: z.date().or(z.string()),
})

export const listarPacientesResponseSchema = z.object({
  items: z.array(pacienteResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const pacienteItemResponseSchema = z.object({
  item: pacienteResponseSchema,
})

export type CrearPacienteInput = z.infer<typeof crearPacienteSchema>
export type ActualizarPacienteInput = z.infer<typeof actualizarPacienteSchema>
export type PacienteQuery = z.infer<typeof pacienteQuerySchema>
export type PacienteResponse = z.infer<typeof pacienteResponseSchema>
