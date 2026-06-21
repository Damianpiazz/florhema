import { z } from 'zod'

export const donacionQuerySchema = z.object({
  donanteId: z.coerce.number().int().positive().optional(),
  fechaDesde: z.coerce.date().optional(),
  fechaHasta: z.coerce.date().optional(),
  tipoDonacion: z.enum(['VOLUNTARIA', 'REPOSICION']).optional(),
  limit: z.coerce.number().int().positive().default(20).optional(),
  offset: z.coerce.number().int().min(0).default(0).optional(),
})

export const donacionDonanteEmbebidoSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
})

export const resultadoSerologiaSchema = z.object({
  id: z.number(),
  hiv: z.boolean(),
  hcv: z.boolean(),
  hbv: z.boolean(),
  chagas: z.boolean(),
  sifilis: z.boolean(),
})

export const donacionResponseSchema = z.object({
  id: z.number(),
  donante: donacionDonanteEmbebidoSchema,
  fecha: z.date().or(z.string()),
  peso: z.number(),
  tensionArterial: z.string(),
  hemoglobina: z.number(),
  tipoDonacion: z.string(),
  reaccionAdversa: z.string().nullable(),
  resultadoSerologia: resultadoSerologiaSchema.nullable(),
})

export const listarDonacionesResponseSchema = z.object({
  items: z.array(donacionResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export const donacionItemResponseSchema = z.object({
  item: donacionResponseSchema,
})

export type DonacionResponse = z.infer<typeof donacionResponseSchema>
export type DonacionQuery = z.infer<typeof donacionQuerySchema>
