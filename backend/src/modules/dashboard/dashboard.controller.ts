import type { Request, Response, NextFunction } from 'express'
import { dashboardQuerySchema } from '@/modules/dashboard/dashboard.schema'
import { getDashboardData } from '@/modules/dashboard/dashboard.service'

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const query = dashboardQuerySchema.parse(req.query)
    const data = await getDashboardData(query)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
