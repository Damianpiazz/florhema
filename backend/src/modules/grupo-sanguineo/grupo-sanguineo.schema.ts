import { z } from 'zod'

export const tipoABOSchema = z.enum(['A', 'B', 'AB', 'O'])

export const factorRhSchema = z.enum(['POSITIVO', 'NEGATIVO'])

export const grupoSanguineoResponseSchema = z.object({
  id: z.number(),
  tipo: tipoABOSchema,
  factorRh: factorRhSchema
})
export const grupoSanguineoListResponseSchema = z.object({
  items: z.array(grupoSanguineoResponseSchema)
})
export type GrupoSanguineoResponse = z.infer<typeof grupoSanguineoResponseSchema>
