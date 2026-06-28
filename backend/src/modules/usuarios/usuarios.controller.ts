import type { Request, Response, NextFunction } from 'express'

import { successResponse } from '@/utils/api-response'
import {
  crearUsuarioSchema,
  actualizarUsuarioSchema,
  listarUsuariosQuerySchema,
} from './usuarios.schema'
import * as usuariosService from './usuarios.service'

/**
 * @openapi
 * /api/v1/usuarios:
 *   get:
 *     tags:
 *       - Usuarios
 *     summary: Listar usuarios
 *     description: Lista paginada de usuarios del sistema. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Resultados por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por email o nombre
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *   post:
 *     tags:
 *       - Usuarios
 *     summary: Crear un usuario
 *     description: Crea un nuevo usuario en el sistema. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               name:
 *                 type: string
 *                 nullable: true
 *               role:
 *                 type: string
 *                 default: USER
 *                 enum: [ADMIN, USER, INVITADO]
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
export async function listar(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listarUsuariosQuerySchema.parse(req.query)
    const result = await usuariosService.listar(query)
    res.json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export async function crear(req: Request, res: Response, next: NextFunction) {
  try {
    const input = crearUsuarioSchema.parse(req.body)
    const user = await usuariosService.crear(input, req.user!.id)
    res.status(201).json(successResponse({ user }))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/usuarios/{id}:
 *   patch:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar un usuario
 *     description: Actualiza los datos de un usuario existente. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               name:
 *                 type: string
 *                 nullable: true
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER, INVITADO]
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Usuario no encontrado
 */
export async function actualizar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    const input = actualizarUsuarioSchema.parse(req.body)
    const user = await usuariosService.actualizar(id, input, req.user!.id)
    res.json(successResponse({ user }))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/usuarios/{id}:
 *   delete:
 *     tags:
 *       - Usuarios
 *     summary: Eliminar un usuario (soft-delete)
 *     description: Elimina lógicamente un usuario. Solo usuarios ADMIN. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Usuario no encontrado
 */
export async function eliminar(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id)
    await usuariosService.eliminar(id, req.user!.id)
    res.json(successResponse({ message: 'Usuario eliminado' }))
  } catch (err) {
    next(err)
  }
}
