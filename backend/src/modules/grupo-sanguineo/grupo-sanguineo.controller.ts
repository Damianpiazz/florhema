import type { Request, Response, NextFunction } from 'express'

import {
  crearGrupoSchema,
  actualizarGrupoSchema,
  grupoSanguineoListResponseSchema
} from '@/modules/grupo-sanguineo/grupo-sanguineo.schema'
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

/**
 * @openapi
 * /api/v1/grupos-sanguineos:
 *   post:
 *     tags:
 *       - Grupos Sanguíneos
 *     summary: Crear un nuevo grupo sanguíneo
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - factorRh
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [A, B, AB, O]
 *               factorRh:
 *                 type: string
 *                 enum: [POSITIVO, NEGATIVO]
 *     responses:
 *       201:
 *         description: Grupo sanguíneo creado
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
 *                         id:
 *                           type: integer
 *                         tipo:
 *                           type: string
 *                         factorRh:
 *                           type: string
 *       400:
 *         description: Error de validación (Zod)
 *       403:
 *         description: Acción no permitida. Se requiere rol ADMIN
 *       409:
 *         description: Ya existe un grupo con esa combinación de tipo y factor Rh
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = crearGrupoSchema.parse(req.body)
    const result = await grupoSanguineoService.crear(data)
    res.status(201).json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/grupos-sanguineos/{id}:
 *   put:
 *     tags:
 *       - Grupos Sanguíneos
 *     summary: Actualizar un grupo sanguíneo
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - factorRh
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [A, B, AB, O]
 *               factorRh:
 *                 type: string
 *                 enum: [POSITIVO, NEGATIVO]
 *     responses:
 *       200:
 *         description: Grupo sanguíneo actualizado
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
 *                         id:
 *                           type: integer
 *                         tipo:
 *                           type: string
 *                         factorRh:
 *                           type: string
 *       400:
 *         description: Error de validación (Zod)
 *       403:
 *         description: Acción no permitida. Se requiere rol ADMIN
 *       404:
 *         description: Grupo sanguíneo no encontrado
 *       409:
 *         description: Ya existe un grupo con esa combinación de tipo y factor Rh
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarGrupoSchema.parse(req.body)
    const result = await grupoSanguineoService.actualizar(id, data)
    res.status(200).json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/grupos-sanguineos/{id}:
 *   delete:
 *     tags:
 *       - Grupos Sanguíneos
 *     summary: Eliminar (soft-delete) un grupo sanguíneo
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Grupo sanguíneo eliminado correctamente
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
 *                     message:
 *                       type: string
 *       403:
 *         description: Acción no permitida. Se requiere rol ADMIN
 *       404:
 *         description: Grupo sanguíneo no encontrado
 *       409:
 *         description: No se puede eliminar el grupo porque tiene personas asociadas
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await grupoSanguineoService.eliminar(id)
    res.status(200).json(successResponse(result))
  } catch (err) {
    next(err)
  }
}
