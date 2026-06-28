import type { Request, Response, NextFunction } from 'express'

import {
  transfusionQuerySchema,
  crearTransfusionSchema,
  actualizarTransfusionSchema,
  listarTransfusionesResponseSchema,
  transfusionItemResponseSchema,
} from '@/modules/transfusion/transfusion.schema'
import * as transfusionService from '@/modules/transfusion/transfusion.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/transfusiones:
 *   get:
 *     tags:
 *       - Transfusiones
 *     summary: Listar transfusiones
 *     description: Lista paginada de transfusiones. Soporta filtros por paciente, rango de fechas y componente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: pacienteId
 *         schema:
 *           type: integer
 *         description: ID del paciente
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
 *         name: componente
 *         schema:
 *           type: string
 *           enum: [GLOBULOS_ROJOS, PLASMA, PLAQUETAS, CRIOPRECIPITADO]
 *         description: Tipo de componente
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
 *         description: Lista paginada de transfusiones
 *       401:
 *         description: No autenticado
 *   post:
 *     tags:
 *       - Transfusiones
 *     summary: Crear una transfusión
 *     description: Registra una nueva transfusión asociada a un paciente existente mediante DNI. Incluye datos de compatibilidad y prueba de Coombs. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dni
 *               - fecha
 *               - componente
 *               - cantidadUnidades
 *               - compatibilidad
 *               - resultadoCoombs
 *             properties:
 *               dni:
 *                 type: string
 *                 description: DNI del paciente
 *               fecha:
 *                 type: string
 *                 format: date-time
 *               componente:
 *                 type: string
 *                 enum: [GLOBULOS_ROJOS, PLASMA, PLAQUETAS, CRIOPRECIPITADO]
 *               cantidadUnidades:
 *                 type: integer
 *                 minimum: 1
 *               reaccionAdversa:
 *                 type: string
 *                 nullable: true
 *               compatibilidad:
 *                 type: object
 *                 required:
 *                   - donanteGrupoId
 *                   - receptorGrupoId
 *                   - compatible
 *                 properties:
 *                   donanteGrupoId:
 *                     type: integer
 *                   receptorGrupoId:
 *                     type: integer
 *                   compatible:
 *                     type: boolean
 *                   motivoIncompatibilidad:
 *                     type: string
 *                     nullable: true
 *               resultadoCoombs:
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
 *         description: Transfusión creada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Paciente no encontrado
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = transfusionQuerySchema.parse(req.query)
    const result = await transfusionService.listar(query)
    const validated = listarTransfusionesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/transfusiones/{id}:
 *   get:
 *     tags:
 *       - Transfusiones
 *     summary: Obtener transfusión por ID
 *     description: Retorna los datos de una transfusión con su paciente, compatibilidad y resultado de Coombs.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la transfusión
 *     responses:
 *       200:
 *         description: Transfusión encontrada
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Transfusión no encontrada
 */
export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await transfusionService.obtener(id)
    const validated = transfusionItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = crearTransfusionSchema.parse(req.body)
    const result = await transfusionService.crear(data)
    const validated = transfusionItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/transfusiones/{id}:
 *   put:
 *     tags:
 *       - Transfusiones
 *     summary: Actualizar una transfusión
 *     description: Actualiza los datos de una transfusión existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la transfusión
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
 *               componente:
 *                 type: string
 *                 enum: [GLOBULOS_ROJOS, PLASMA, PLAQUETAS, CRIOPRECIPITADO]
 *               cantidadUnidades:
 *                 type: integer
 *                 minimum: 1
 *               reaccionAdversa:
 *                 type: string
 *                 nullable: true
 *               compatibilidad:
 *                 type: object
 *                 properties:
 *                   donanteGrupoId:
 *                     type: integer
 *                   receptorGrupoId:
 *                     type: integer
 *                   compatible:
 *                     type: boolean
 *                   motivoIncompatibilidad:
 *                     type: string
 *                     nullable: true
 *               resultadoCoombs:
 *                 type: object
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     enum: [DIRECTO, INDIRECTO]
 *                   positivo:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Transfusión actualizada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Transfusión no encontrada
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarTransfusionSchema.parse(req.body)
    const item = await transfusionService.actualizar(id, data)
    const validated = transfusionItemResponseSchema.parse({ item })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/transfusiones/{id}:
 *   delete:
 *     tags:
 *       - Transfusiones
 *     summary: Eliminar una transfusión (soft-delete)
 *     description: Elimina lógicamente una transfusión. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la transfusión
 *     responses:
 *       200:
 *         description: Transfusión eliminada exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Transfusión no encontrada
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await transfusionService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
