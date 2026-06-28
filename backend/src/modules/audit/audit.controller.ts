import type { Request, Response, NextFunction } from 'express'
import { successResponse } from '@/utils/api-response'
import { auditQuerySchema } from './audit.schema'
import * as auditService from './audit.service'

/**
 * @openapi
 * /api/v1/audit:
 *   get:
 *     tags:
 *       - Auditoría
 *     summary: Listar registros de auditoría
 *     description: Lista paginada de registros de auditoría del sistema. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Resultados por página
 *       - in: query
 *         name: entity
 *         schema:
 *           type: string
 *         description: Filtrar por entidad (ej. donante, donacion)
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *         description: Filtrar por acción
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial (inclusive)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final (inclusive)
 *     responses:
 *       200:
 *         description: Lista paginada de registros de auditoría
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const query = auditQuerySchema.parse(req.query)
    const result = await auditService.listar(query)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}
