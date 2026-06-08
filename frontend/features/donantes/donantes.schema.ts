import { z } from 'zod'

export const donantePersonaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
})

export const donanteSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  persona: donantePersonaSchema,
  semaforoAptitud: z.string(),
  createdAt: z.string(),
})

export const donanteItemResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: donanteSchema,
  }),
})

export const listarDonantesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(donanteSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
})

export type Donante = z.infer<typeof donanteSchema>
export type ListarDonantesResponse = z.infer<typeof listarDonantesResponseSchema>
