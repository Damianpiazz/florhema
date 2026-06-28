import type { Request, Response, NextFunction } from 'express'

import {
  crearPacienteSchema,
  actualizarPacienteSchema,
  pacienteQuerySchema,
  listarPacientesResponseSchema,
  pacienteItemResponseSchema,
} from '@/modules/paciente/paciente.schema'
import * as pacienteService from '@/modules/paciente/paciente.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/pacientes:
 *   get:
 *     tags:
 *       - Pacientes
 *     summary: Listar pacientes
 *     description: Lista paginada de pacientes. Soporta filtros por DNI, nombre y apellido. Requiere autenticación.
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
 *         description: Lista paginada de pacientes
 *       401:
 *         description: No autenticado
 */
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = pacienteQuerySchema.parse(req.query)
    const result = await pacienteService.listar(query)
    const validated = listarPacientesResponseSchema.parse(result)
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/personas/{personaId}/paciente:
 *   post:
 *     tags:
 *       - Pacientes
 *     summary: Crear un paciente
 *     description: Registra un nuevo paciente asociado a una persona existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: personaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la persona
 *     responses:
 *       201:
 *         description: Paciente creado exitosamente
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
    const data = crearPacienteSchema.parse(req.body)
    const result = await pacienteService.crear(personaId, data)
    const validated = pacienteItemResponseSchema.parse({ item: result })
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/pacientes/{id}:
 *   put:
 *     tags:
 *       - Pacientes
 *     summary: Actualizar un paciente
 *     description: Actualiza los datos de un paciente existente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Paciente no encontrado
 */
export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const data = actualizarPacienteSchema.parse(req.body)
    const result = await pacienteService.actualizar(id, data)
    const validated = pacienteItemResponseSchema.parse({ item: result })
    res.status(200).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/pacientes/{id}:
 *   delete:
 *     tags:
 *       - Pacientes
 *     summary: Eliminar un paciente (soft-delete)
 *     description: Elimina lógicamente un paciente. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Paciente eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Paciente no encontrado
 */
export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await pacienteService.eliminar(id)
    res.status(200).json(successResponse(null))
  } catch (err) {
    next(err)
  }
}
