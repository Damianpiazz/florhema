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

export const serologiaInputSchema = z.object({
  hiv: z.boolean(),
  hcv: z.boolean(),
  hbv: z.boolean(),
  chagas: z.boolean(),
  sifilis: z.boolean(),
})

export const crearDonacionInputSchema = z.object({
  dni: z.string().min(1, 'El DNI es requerido'),
  fecha: z.string().min(1, 'La fecha es requerida'),
  peso: z.coerce.number().positive().min(50, 'El peso mínimo es 50 kg'),
  tensionArterial: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Formato: sistólica/diastólica (ej. 120/80)'),
  hemoglobina: z.coerce.number().positive().min(12.5, 'La hemoglobina mínima es 12.5 g/dL'),
   tipoDonacion: z.enum(['VOLUNTARIA', 'REPOSICION'], { message: 'El tipo de donación es requerido' }),
  reaccionAdversa: z.string().nullable().optional(),
  resultadoSerologia: serologiaInputSchema.nullable().optional(),
})

export const actualizarDonacionInputSchema = crearDonacionInputSchema

export type Donacion = z.infer<typeof donacionSchema>
export type ListarDonacionesResponse = z.infer<typeof listarDonacionesResponseSchema>
export type CrearDonacionInput = z.infer<typeof crearDonacionInputSchema>
export type SerologiaInput = z.infer<typeof serologiaInputSchema>
export type ActualizarDonacionInput = z.infer<typeof actualizarDonacionInputSchema>
