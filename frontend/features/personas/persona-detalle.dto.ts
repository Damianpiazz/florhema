import { z } from 'zod'
import { personaDetalleResponseSchema } from './persona-detalle.schema'
import type { PersonaDetalle } from './persona-detalle.schema'

export function parsePersonaDetalleResponse(data: unknown): PersonaDetalle {
  return personaDetalleResponseSchema.parse(data).data
}

export function parseListarResponse<T>(
  data: unknown,
  itemSchema: z.ZodType<T>,
): { items: T[]; total: number; limit: number; offset: number } {
  const schema = z.object({
    success: z.literal(true),
    data: z.object({
      items: z.array(itemSchema),
      total: z.number(),
      limit: z.number(),
      offset: z.number(),
    }),
  })
  return schema.parse(data).data
}
