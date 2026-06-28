import { z } from 'zod'
import { listarPacientesResponseSchema, pacienteSchema } from './pacientes.schema'
import type { ListarPacientesResponse, Paciente } from './pacientes.schema'

const successItemResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    item: pacienteSchema,
  }),
})

export function parseListarPacientesResponse(data: unknown): ListarPacientesResponse['data'] {
  return listarPacientesResponseSchema.parse(data).data
}

export function parsePacienteItemResponse(data: unknown): Paciente {
  return successItemResponseSchema.parse(data).data.item
}
