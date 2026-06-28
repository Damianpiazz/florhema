import type { Request, Response, NextFunction } from 'express'

import {
  estudioGestanteQuerySchema,
  crearEstudioGestanteSchema,
  actualizarEstudioGestanteSchema,
  listarEstudiosGestanteResponseSchema,
  estudioGestanteItemResponseSchema,
} from '@/modules/estudio-gestante/estudio-gestante.schema'
import * as estudioGestanteService from '@/modules/estudio-gestante/estudio-gestante.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/estudios-gestante/gestantes/{gestanteId}/estudios:
 *   get:
 *     tags:
 *       - Estudios de Gestante
 *     summary: Listar estudios por gestante
 *     description: Lista paginada de estudios de una gestante. Soporta filtros por rango de fechas y estado. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: gestanteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la gestante
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
 *         name: estadoEstudio
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, COMPLETADO, CANCELADO]
 *         description: Estado del estudio
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
 *         description: Lista paginada de estudios
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Gestante no encontrada
 *   post:
 *     tags:
 *       - Estudios de Gestante
 *     summary: Crear un estudio de gestante
 *     description: Registra un nuevo estudio para una gestante. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: gestanteId
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
 *             required:
 *               - fecha
 *               - compatibilidadConyugal
 *               - pruebaCoombsIndirecta
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               compatibilidadConyugal:
 *                 type: string
 *               estadoEstudio:
 *                 type: string
 *                 default: PENDIENTE
 *                 enum: [PENDIENTE, COMPLETADO, CANCELADO]
 *               pruebaCoombsIndirecta:
 *                 type: object
 *                 required:
 *                   - tipo
 *                   - positivo
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [DIRECTO, INDIRECTO]
 *                   positivo:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Estudio creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Gestante no encontrada
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = Number(req.params.gestanteId)
    const query = estudioGestanteQuerySchema.parse(req.query)
    const result = await estudioGestanteService.listar(gestanteId, query)
    const validated = listarEstudiosGestanteResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/estudios-gestante:
 *   get:
 *     tags:
 *       - Estudios de Gestante
 *     summary: Listar todos los estudios de gestante
 *     description: Lista paginada de todos los estudios de gestante. Soporta filtros por rango de fechas y estado. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         name: estadoEstudio
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, COMPLETADO, CANCELADO]
 *         description: Estado del estudio
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
 *         description: Lista paginada de todos los estudios
 *       401:
 *         description: No autenticado
 */
export async function listAll(req: Request, res: Response, next: NextFunction) {
  try {
    const query = estudioGestanteQuerySchema.parse(req.query)
    const result = await estudioGestanteService.listarTodos(query)
    const validated = listarEstudiosGestanteResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = Number(req.params.gestanteId)
    const data = crearEstudioGestanteSchema.parse(req.body)
    const result = await estudioGestanteService.crear(gestanteId, data)
    const validated = estudioGestanteItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/estudios-gestante/{id}:
 *   put:
 *     tags:
 *       - Estudios de Gestante
 *     summary: Actualizar un estudio de gestante
 *     description: Actualiza los datos de un estudio de gestante existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               compatibilidadConyugal:
 *                 type: string
 *               estadoEstudio:
 *                 type: string
 *                 enum: [PENDIENTE, COMPLETADO, CANCELADO]
 *               pruebaCoombsIndirecta:
 *                 type: object
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [DIRECTO, INDIRECTO]
 *                   positivo:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Estudio actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Estudio no encontrado
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarEstudioGestanteSchema.parse(req.body)
    const result = await estudioGestanteService.actualizar(id, data)
    const validated = estudioGestanteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/estudios-gestante/{id}:
 *   delete:
 *     tags:
 *       - Estudios de Gestante
 *     summary: Eliminar un estudio de gestante (soft-delete)
 *     description: Elimina lógicamente un estudio de gestante. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudio
 *     responses:
 *       200:
 *         description: Estudio eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Estudio no encontrado
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await estudioGestanteService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
