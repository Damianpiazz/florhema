import { z } from 'zod'

export const dashboardQuerySchema = z.object({
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
})

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>
