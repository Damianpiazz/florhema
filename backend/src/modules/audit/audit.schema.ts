import { z } from 'zod'

export const auditQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  entity: z.string().optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE']).optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional()
}).refine(
  (data) => {
    if (data.fechaDesde && data.fechaHasta) {
      return new Date(data.fechaDesde) <= new Date(data.fechaHasta)
    }
    return true
  },
  { message: 'La fecha desde no puede ser posterior a la fecha hasta' }
)
