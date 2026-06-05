import type { Request, Response, NextFunction } from 'express'

import { personaQuerySchema, listarPersonasResponseSchema, crearPersonaSchema, crearPersonaResponseSchema } from '@/modules/persona/persona.schema'
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

/**
 * @openapi
 * /api/v1/personas:
 *   post:
 *     tags:
 *       - Personas
 *     summary: Crear una persona
 *     description: Registra una nueva persona en el sistema. Requiere autenticación.
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
 *               - nombre
 *               - apellido
 *               - fechaNacimiento
 *               - direccion
 *               - telefono
 *               - grupoSanguineoId
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
 *     responses:
 *       201:
 *         description: Persona creada exitosamente
 *       400:
 *         description: Error de validación (Zod)
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Grupo sanguíneo no encontrado
 *       409:
 *         description: DNI duplicado
 */
export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const data = crearPersonaSchema.parse(req.body)
    const item = await personaService.crear(data, req.user!.id)
    const validated = crearPersonaResponseSchema.parse({ item })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}