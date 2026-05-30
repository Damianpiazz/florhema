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

export type GrupoSanguineo = z.infer<typeof grupoSanguineoSchema>
export type ListarGruposResponse = z.infer<typeof listarGruposResponseSchema>
