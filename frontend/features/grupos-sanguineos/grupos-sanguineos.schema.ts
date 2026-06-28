import { z } from 'zod'

export const grupoSanguineoSchema = z.object({
  id: z.number(),
  tipo: z.string(),
  factorRh: z.string(),
})

export const listarGruposResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(grupoSanguineoSchema),
  }),
})

export const crearGrupoInputSchema = z.object({
  tipo: z.string(),
  factorRh: z.string(),
})

export const actualizarGrupoInputSchema = crearGrupoInputSchema

export const grupoItemResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: grupoSanguineoSchema,
  }),
})

export const eliminarGrupoResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    message: z.string(),
  }),
})

export type GrupoSanguineo = z.infer<typeof grupoSanguineoSchema>
export type ListarGruposResponse = z.infer<typeof listarGruposResponseSchema>
export type CrearGrupoInput = z.infer<typeof crearGrupoInputSchema>
export type ActualizarGrupoInput = z.infer<typeof actualizarGrupoInputSchema>
