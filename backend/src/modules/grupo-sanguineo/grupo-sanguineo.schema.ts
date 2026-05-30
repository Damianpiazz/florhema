import { z } from 'zod'

import { TipoABO, FactorRh } from '@/generated/prisma/enums'

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

export const grupoSanguineoItemResponseSchema = z.object({
  item: grupoSanguineoResponseSchema
})

export const actualizarGrupoSchema = z.object({
  tipo: z.nativeEnum(TipoABO),
  factorRh: z.nativeEnum(FactorRh)
})

export type GrupoSanguineoResponse = z.infer<typeof grupoSanguineoResponseSchema>
export type ActualizarGrupoInput = z.infer<typeof actualizarGrupoSchema>
