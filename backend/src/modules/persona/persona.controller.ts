import type { Request, Response, NextFunction } from 'express'

import { personaQuerySchema, listarPersonasResponseSchema } from '@/modules/persona/persona.schema'
import * as personaService from '@/modules/persona/persona.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/personas:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Listar personas
 *     description: Lista paginada de personas. Soporta búsqueda por DNI. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: dni
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por DNI
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
 *         description: Lista paginada de personas
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
 *                           dni:
 *                             type: string
 *                           nombre:
 *                             type: string
 *                           apellido:
 *                             type: string
 *                           fechaNacimiento:
 *                             type: string
 *                             format: date-time
 *                           direccion:
 *                             type: string
 *                           telefono:
 *                             type: string
 *                           grupoSanguineo:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               tipo:
 *                                 type: string
 *                               factorRh:
 *                                 type: string
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *       401:
 *         description: No autenticado
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = personaQuerySchema.parse(req.query)
    const result = await personaService.listar(query)
    const validated = listarPersonasResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}