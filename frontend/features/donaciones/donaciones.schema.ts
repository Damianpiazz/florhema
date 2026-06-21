import { z } from 'zod'

export const resultadoSerologiaSchema = z.object({
  id: z.number(),
  hiv: z.boolean(),
  hcv: z.boolean(),
  hbv: z.boolean(),
  chagas: z.boolean(),
  sifilis: z.boolean(),
})

export const donacionSchema = z.object({
  id: z.number(),
  donante: z.object({
    id: z.number(),
    personaId: z.number(),
    dni: z.string(),
    nombre: z.string(),
    apellido: z.string(),
  }),
  fecha: z.string(),
  peso: z.number(),
  tensionArterial: z.string(),
  hemoglobina: z.number(),
  tipoDonacion: z.string(),
  reaccionAdversa: z.string().nullable(),
  resultadoSerologia: resultadoSerologiaSchema.nullable(),
})

export const donacionItemResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: donacionSchema,
  }),
})

export const listarDonacionesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(donacionSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
})

export type Donacion = z.infer<typeof donacionSchema>
export type ListarDonacionesResponse = z.infer<typeof listarDonacionesResponseSchema>
