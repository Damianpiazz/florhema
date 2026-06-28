import type { Request, Response, NextFunction } from 'express'
import { dashboardQuerySchema } from '@/modules/dashboard/dashboard.schema'
import { getDashboardData } from '@/modules/dashboard/dashboard.service'

/**
 * @openapi
 * /api/v1/reportes/dashboard:
 *   get:
 *     tags:
 *       - Reportes
 *     summary: Obtener datos del dashboard
 *     description: Retorna datos agregados para el dashboard. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: Datos del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: No autenticado
 */
export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const query = dashboardQuerySchema.parse(req.query)
    const data = await getDashboardData(query)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
