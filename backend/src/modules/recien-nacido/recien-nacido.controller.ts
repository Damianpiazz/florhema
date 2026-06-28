import type { Request, Response, NextFunction } from 'express'

import {
  crearRecienNacidoSchema,
  actualizarRecienNacidoSchema,
  listarRecienNacidosResponseSchema,
  recienNacidoItemResponseSchema,
} from '@/modules/recien-nacido/recien-nacido.schema'
import * as recienNacidoService from '@/modules/recien-nacido/recien-nacido.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/recien-nacidos:
 *   get:
 *     tags:
 *       - Recién Nacidos
 *     summary: Listar recién nacidos
 *     description: Lista paginada de recién nacidos. Opcionalmente filtrar por gestante. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: gestanteId
 *         schema:
 *           type: integer
 *         description: ID de la gestante (opcional)
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
 *         description: Lista paginada de recién nacidos
 *       401:
 *         description: No autenticado
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = req.query.gestanteId ? Number(req.query.gestanteId) : undefined
    const limit = Number(req.query.limit) || 20
    const offset = Number(req.query.offset) || 0
    const result = await recienNacidoService.listar(gestanteId, { limit, offset })
    const validated = listarRecienNacidosResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/recien-nacidos/gestantes/{gestanteId}/recien-nacidos:
 *   post:
 *     tags:
 *       - Recién Nacidos
 *     summary: Crear un recién nacido
 *     description: Registra un nuevo recién nacido asociado a una gestante. Requiere autenticación.
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
 *               - dni
 *               - nombre
 *               - apellido
 *               - fechaNacimiento
 *               - direccion
 *               - telefono
 *               - grupoSanguineoId
 *               - pruebaCoombsDirecta
 *             properties:
 *               dni:
 *                 type: string
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               fechaNacimiento:
 *                 type: string
 *                 format: date
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               grupoSanguineoId:
 *                 type: integer
 *               pruebaCoombsDirecta:
 *                 type: object
 *                 required:
 *                   - tipo
 *                   - positivo
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [DIRECTO]
 *                   positivo:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Recién nacido creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Gestante no encontrada
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const gestanteId = Number(req.params.gestanteId)
    const data = crearRecienNacidoSchema.parse(req.body)
    const result = await recienNacidoService.crear(gestanteId, data)
    const validated = recienNacidoItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/recien-nacidos/{id}:
 *   put:
 *     tags:
 *       - Recién Nacidos
 *     summary: Actualizar un recién nacido
 *     description: Actualiza los datos de un recién nacido existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recién nacido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               grupoSanguineoId:
 *                 type: integer
 *               pruebaCoombsDirecta:
 *                 type: object
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [DIRECTO]
 *                   positivo:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Recién nacido actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Recién nacido no encontrado
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarRecienNacidoSchema.parse(req.body)
    const result = await recienNacidoService.actualizar(id, data)
    const validated = recienNacidoItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/recien-nacidos/{id}:
 *   get:
 *     tags:
 *       - Recién Nacidos
 *     summary: Obtener recién nacido por ID
 *     description: Retorna los datos de un recién nacido con su persona asociada y resultado de Coombs.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recién nacido
 *     responses:
 *       200:
 *         description: Recién nacido encontrado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Recién nacido no encontrado
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await recienNacidoService.obtener(id)
    const validated = recienNacidoItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/recien-nacidos/{id}:
 *   delete:
 *     tags:
 *       - Recién Nacidos
 *     summary: Eliminar un recién nacido (soft-delete)
 *     description: Elimina lógicamente un recién nacido. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del recién nacido
 *     responses:
 *       200:
 *         description: Recién nacido eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Recién nacido no encontrado
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await recienNacidoService.eliminar(id)
    res.status(200).json(successResponse({ message: 'Recién nacido eliminado correctamente' }))
  } catch (err) {
    next(err)
  }
}
