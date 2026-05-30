import type { Request, Response, NextFunction } from 'express'

import { grupoSanguineoListResponseSchema } from '@/modules/grupo-sanguineo/grupo-sanguineo.schema'
import * as grupoSanguineoService from '@/modules/grupo-sanguineo/grupo-sanguineo.service'
import { successResponse } from '@/utils/api-response'
/**
 * @openapi
 * /api/v1/grupos-sanguineos:
 *   get:
 *     tags:
 *       - Grupos Sanguíneos
 *     summary: Listar todos los grupos sanguíneos activos
 *     responses:
 *       200:
 *         description: Lista de grupos sanguíneos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           tipo:
 *                             type: string
 *                             enum: [A, B, AB, O]
 *                           factorRh:
 *                             type: string
 *                             enum: [POSITIVO, NEGATIVO]
 */
export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    const items = await grupoSanguineoService.listar()
    const validated = grupoSanguineoListResponseSchema.parse({ items })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}
