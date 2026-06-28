import { z } from 'zod'

export const reporteQuerySchema = z.object({
  planilla: z.coerce.number().int().min(1).max(5),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
})

export type ReporteQuery = z.infer<typeof reporteQuerySchema>
