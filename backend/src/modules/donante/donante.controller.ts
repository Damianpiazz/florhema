import type { Request, Response, NextFunction } from 'express'

import {
  donanteQuerySchema,
  listarDonantesResponseSchema,
  donanteItemResponseSchema,
  calcularSemaforoResponseSchema,
} from '@/modules/donante/donante.schema'
import * as donanteService from '@/modules/donante/donante.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/donantes:
 *   get:
 *     tags:
 *       - Donantes
 *     summary: Listar donantes
 *     description: Lista paginada de donantes. Soporta filtros por DNI, nombre, apellido y semáforo de aptitud. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: dni
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por DNI
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por nombre
 *       - in: query
 *         name: apellido
 *         schema:
 *           type: string
 *         description: Búsqueda parcial por apellido
 *       - in: query
 *         name: semaforoAptitud
 *         schema:
 *           type: string
 *           enum: [VERDE, AMARILLO, ROJO]
 *         description: Filtro por estado del semáforo
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
 *         description: Lista paginada de donantes
 *       401:
 *         description: No autenticado
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = donanteQuerySchema.parse(req.query)
    const result = await donanteService.listar(query)
    const validated = listarDonantesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/donantes/{id}:
 *   get:
 *     tags:
 *       - Donantes
 *     summary: Obtener donante por ID
 *     description: Retorna los datos de un donante junto con su persona asociada.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del donante
 *     responses:
 *       200:
 *         description: Donante encontrado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Donante no encontrado
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await donanteService.obtener(id)
    const validated = donanteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/donantes/dni/{dni}:
 *   get:
 *     tags:
 *       - Donantes
 *     summary: Obtener donante por DNI
 *     description: Retorna los datos de un donante buscando por el DNI de su persona asociada.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *         description: DNI del donante
 *     responses:
 *       200:
 *         description: Donante encontrado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Donante no encontrado
 */
export async function getByDni(req: Request, res: Response, next: NextFunction) {
  try {
    const dni = req.params.dni as string
    const result = await donanteService.buscarPorDni(dni)
    const validated = donanteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/donantes/{id}/calcular-semaforo:
 *   post:
 *     tags:
 *       - Donantes
 *     summary: Calcular semáforo de aptitud
 *     description: Calcula y actualiza el semáforo de aptitud de un donante basado en sus donaciones y estudios. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del donante
 *     responses:
 *       200:
 *         description: Semáforo calculado exitosamente
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
 *                     item:
 *                       type: object
 *                       properties:
 *                         semaforoAptitud:
 *                           type: string
 *                           enum: [VERDE, AMARILLO, ROJO]
 *                         motivo:
 *                           type: string
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Donante no encontrado
 */
export async function calcular(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await donanteService.calcularSemaforo(id)
    const validated = calcularSemaforoResponseSchema.parse(result)
    res.status(200).json(successResponse({ item: validated }))
  } catch (err) {
    next(err)
  }
}
