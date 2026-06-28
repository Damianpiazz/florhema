import type { Request, Response, NextFunction } from 'express'
import { reporteQuerySchema } from '@/modules/reporte/reporte.schema'
import { generarReporte } from '@/modules/reporte/reporte.service'

export async function getReporteHemo(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reporteQuerySchema.parse(req.query)
    const buffer = await generarReporte(query)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="hemo-${query.planilla}.xlsx"`)
    res.send(buffer)
  } catch (err) {
    next(err)
  }
}
