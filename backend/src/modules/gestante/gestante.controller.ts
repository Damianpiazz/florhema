import type { Request, Response, NextFunction } from 'express'

import {
  crearGestanteSchema,
  actualizarGestanteSchema,
  gestanteQuerySchema,
  listarGestantesResponseSchema,
  gestanteItemResponseSchema,
} from '@/modules/gestante/gestante.schema'
import * as gestanteService from '@/modules/gestante/gestante.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/gestantes:
 *   get:
 *     tags:
 *       - Gestantes
 *     summary: Listar gestantes
 *     description: Lista paginada de gestantes. Soporta filtros por DNI, nombre y apellido. Requiere autenticación.
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
 *         description: Lista paginada de gestantes
 *       401:
 *         description: No autenticado
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = gestanteQuerySchema.parse(req.query)
    const result = await gestanteService.listar(query)
    const validated = listarGestantesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{personaId}/gestante:
 *   post:
 *     tags:
 *       - Gestantes
 *     summary: Crear una gestante
 *     description: Registra una nueva gestante asociada a una persona existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               antecedentesObstetricos:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Gestante creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const personaId = Number(req.params.personaId)
    const data = crearGestanteSchema.parse(req.body)
    const result = await gestanteService.crear(personaId, data)
    const validated = gestanteItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/gestantes/{id}:
 *   put:
 *     tags:
 *       - Gestantes
 *     summary: Actualizar una gestante
 *     description: Actualiza los datos de una gestante existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la gestante
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               antecedentesObstetricos:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Gestante actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Gestante no encontrada
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarGestanteSchema.parse(req.body)
    const result = await gestanteService.actualizar(id, data)
    const validated = gestanteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/gestantes/{id}:
 *   delete:
 *     tags:
 *       - Gestantes
 *     summary: Eliminar una gestante (soft-delete)
 *     description: Elimina lógicamente una gestante. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la gestante
 *     responses:
 *       200:
 *         description: Gestante eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Gestante no encontrada
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await gestanteService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
