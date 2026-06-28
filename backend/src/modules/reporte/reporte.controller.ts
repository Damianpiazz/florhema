import type { Request, Response, NextFunction } from 'express'
import { reporteQuerySchema } from '@/modules/reporte/reporte.schema'
import { generarReporte } from '@/modules/reporte/reporte.service'

/**
 * @openapi
 * /api/v1/reportes/hemo:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Generar reporte de hemo (Excel)
 *     description: Genera y retorna un archivo Excel con datos de la planilla solicitada. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: planilla
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Número de planilla (1 a 5)
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (opcional)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (opcional)
 *     responses:
 *       200:
 *         description: Archivo Excel del reporte
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 */
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
