import { z } from 'zod'

export const gestantePersonaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
})

export const gestanteSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  persona: gestantePersonaSchema,
  antecedentesObstetricos: z.string().nullable(),
  createdAt: z.string(),
})

export const listarGestantesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(gestanteSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
})

export type Gestante = z.infer<typeof gestanteSchema>
export type ListarGestantesResponse = z.infer<typeof listarGestantesResponseSchema>
