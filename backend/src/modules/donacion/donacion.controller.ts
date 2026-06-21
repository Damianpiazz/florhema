import type { Request, Response, NextFunction } from 'express'

import {
  donacionQuerySchema,
  listarDonacionesResponseSchema,
  donacionItemResponseSchema,
} from '@/modules/donacion/donacion.schema'
import * as donacionService from '@/modules/donacion/donacion.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/donaciones:
 *   get:
 *     tags:
 *       - Donaciones
 *     summary: Listar donaciones
 *     description: Lista paginada de donaciones. Soporta filtros por donante, rango de fechas y tipo de donación. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: donanteId
 *         schema:
 *           type: integer
 *         description: ID del donante
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
 *       - in: query
 *         name: tipoDonacion
 *         schema:
 *           type: string
 *           enum: [VOLUNTARIA, REPOSICION]
 *         description: Tipo de donación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Resultados por página (máx 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Desplazamiento para paginación
 *     responses:
 *       200:
 *         description: Lista paginada de donaciones
 *       401:
 *         description: No autenticado
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = donacionQuerySchema.parse(req.query)
    const result = await donacionService.listar(query)
    const validated = listarDonacionesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/donaciones/{id}:
 *   get:
 *     tags:
 *       - Donaciones
 *     summary: Obtener donación por ID
 *     description: Retorna los datos de una donación con su donante y resultados de serología.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la donación
 *     responses:
 *       200:
 *         description: Donación encontrada
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Donación no encontrada
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await donacionService.obtener(id)
    const validated = donacionItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}
