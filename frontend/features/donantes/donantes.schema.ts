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

export const calcularSemaforoResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: z.object({
      semaforoAptitud: z.enum(['VERDE', 'AMARILLO', 'ROJO']),
      motivo: z.string(),
    }),
  }),
})

export type CalcularSemaforoResponse = z.infer<typeof calcularSemaforoResponseSchema>

export type Donante = z.infer<typeof donanteSchema>
export type ListarDonantesResponse = z.infer<typeof listarDonantesResponseSchema>
