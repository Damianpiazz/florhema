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

export const crearGrupoSchema = z.object({
  tipo: z.nativeEnum(TipoABO),
  factorRh: z.nativeEnum(FactorRh)
})

export const actualizarGrupoSchema = crearGrupoSchema

export type GrupoSanguineoResponse = z.infer<typeof grupoSanguineoResponseSchema>
export type CrearGrupoInput = z.infer<typeof crearGrupoSchema>
export type ActualizarGrupoInput = z.infer<typeof actualizarGrupoSchema>
