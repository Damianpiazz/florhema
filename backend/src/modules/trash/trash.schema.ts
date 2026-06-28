import { z } from 'zod'

export const trashParamsSchema = z.object({
  entityType: z.enum(['persona', 'donante', 'paciente', 'gestante', 'donacion', 'transfusion', 'user']),
  id: z.coerce.number().int().positive(),
})

export type TrashParams = z.infer<typeof trashParamsSchema>

export const trashQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  entityType: z.enum(['persona', 'donante', 'paciente', 'gestante', 'donacion', 'transfusion', 'user']).optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
})

export type TrashQuery = z.infer<typeof trashQuerySchema>
