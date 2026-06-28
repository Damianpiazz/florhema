import { z } from 'zod'

export const pacientePersonaSchema = z.object({
  id: z.number(),
  dni: z.string(),
  nombre: z.string(),
  apellido: z.string(),
})

export const pacienteSchema = z.object({
  id: z.number(),
  personaId: z.number(),
  persona: pacientePersonaSchema,
  createdAt: z.string(),
})

export const listarPacientesResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    items: z.array(pacienteSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
  }),
})

export type Paciente = z.infer<typeof pacienteSchema>
export type ListarPacientesResponse = z.infer<typeof listarPacientesResponseSchema>
