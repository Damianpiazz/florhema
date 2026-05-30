import { z } from 'zod'

export const personaQuerySchema = z.object({
  dni: z.string().optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const grupoSanguineoEmbebidoSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  factorRh: z.string(),
})

export const personaResponseSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  fechaNacimiento: z.date().or(z.string()),
  direccion: z.string(),
  telefono: z.string(),
  grupoSanguineo: grupoSanguineoEmbebidoSchema,
})

export const listarPersonasResponseSchema = z.object({
  items: z.array(personaResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export type PersonaResponse = z.infer<typeof personaResponseSchema>