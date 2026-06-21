import type { Request, Response, NextFunction } from 'express'

import {
  personaQuerySchema,
  paginatedQuerySchema,
  listarPersonasResponseSchema,
  crearPersonaSchema,
  crearPersonaResponseSchema,
  actualizarPersonaSchema,
  actualizarPersonaResponseSchema,
  personaDetalleResponseSchema,
  listarDonacionesResponseSchema,
  listarTransfusionesResponseSchema,
  listarEstudiosGestanteResponseSchema,
  listarRecienNacidosResponseSchema,
  listarActividadResponseSchema,
  personaDniItemResponseSchema,
} from '@/modules/persona/persona.schema'
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
    const item = await personaService.crear(data)
    const validated = crearPersonaResponseSchema.parse({ item })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}:
 *   put:
 *     tags:
 *       - Personas
 *     summary: Actualizar una persona
 *     description: Actualiza los datos de una persona existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *       200:
 *         description: Persona actualizada exitosamente
 *       400:
 *         description: Error de validación (Zod)
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada o grupo sanguíneo no encontrado
 *       409:
 *         description: DNI duplicado
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarPersonaSchema.parse(req.body)
    const item = await personaService.actualizar(id, data)
    const validated = actualizarPersonaResponseSchema.parse({ item })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}:
 *   delete:
 *     tags:
 *       - Personas
 *     summary: Eliminar una persona (soft-delete)
 *     description: Eliminación lógica de una persona. Requiere rol ADMIN.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     responses:
 *       200:
 *         description: Persona eliminada correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acción no permitida. Se requiere rol ADMIN
 *       404:
 *         description: Persona no encontrada
 *       409:
 *         description: Persona con donante/paciente/gestante activo
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await personaService.eliminar(id)
    res.status(200).json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Obtener detalle de persona
 *     description: Retorna datos de la persona, grupo sanguíneo y sus roles (donante/paciente/gestante).
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
 *         description: Detalle de persona
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function detalle(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const result = await personaService.obtenerDetalle(id)
    const validated = personaDetalleResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}/donaciones:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Listar donaciones de una persona
 *     description: Donaciones paginadas con resultado de serología.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista paginada de donaciones
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function listarDonaciones(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const query = paginatedQuerySchema.parse(req.query)
    const result = await personaService.listarDonaciones(id, query)
    const validated = listarDonacionesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}/transfusiones:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Listar transfusiones de una persona
 *     description: Transfusiones paginadas con compatibilidad y resultado Coombs.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista paginada de transfusiones
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function listarTransfusiones(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const query = paginatedQuerySchema.parse(req.query)
    const result = await personaService.listarTransfusiones(id, query)
    const validated = listarTransfusionesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}/estudios-gestante:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Listar estudios gestacionales de una persona
 *     description: Estudios gestacionales paginados con prueba Coombs indirecta.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista paginada de estudios gestacionales
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function listarEstudios(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const query = paginatedQuerySchema.parse(req.query)
    const result = await personaService.listarEstudios(id, query)
    const validated = listarEstudiosGestanteResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}/recien-nacidos:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Listar recién nacidos de una gestante
 *     description: Recién nacidos paginados con prueba Coombs directa.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Lista paginada de recién nacidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function listarRecienNacidos(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const query = paginatedQuerySchema.parse(req.query)
    const result = await personaService.listarRecienNacidos(id, query)
    const validated = listarRecienNacidosResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{id}/actividad:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Timeline unificado de actividad de una persona
 *     description: Retorna donaciones, transfusiones, estudios gestacionales y recién nacidos mezclados y ordenados por fecha descendente.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: Timeline paginado de actividad
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function listarActividad(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const query = paginatedQuerySchema.parse(req.query)
    const result = await personaService.listarActividad(id, query)
    const validated = listarActividadResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/dni/{dni}:
 *   get:
 *     tags:
 *       - Personas
 *     summary: Obtener persona por DNI
 *     description: Retorna los datos básicos de una persona buscando por DNI exacto.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: dni
 *         required: true
 *         schema:
 *           type: string
 *         description: DNI de la persona
 *     responses:
 *       200:
 *         description: Persona encontrada
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Persona no encontrada
 */
export async function getByDni(req: Request, res: Response, next: NextFunction) {
  try {
    const dni = req.params.dni
    const result = await personaService.buscarPorDni(dni)
    const validated = personaDniItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}