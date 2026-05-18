import type { Request, Response, NextFunction } from 'express'
import { registerSchema, registerResponseSchema } from '@/modules/auth/auth.schema'
import * as authService from '@/modules/auth/auth.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Registrar un nuevo usuario
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
 *                 example: tecnico@hospital.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: miPassword123
 *               name:
 *                 type: string
 *                 example: Facundo Gómez
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         email:
 *                           type: string
 *                         name:
 *                           type: string
 *                           nullable: true
 *                         role:
 *                           type: string
 *                           enum: [ADMIN, USER, INVITADO]
 *                     token:
 *                       type: string
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *       409:
 *         description: El email ya está registrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const input = registerSchema.parse(req.body)
    const result = await authService.register(input)
    const validated = registerResponseSchema.parse(result)
    res.status(201).json(successResponse(validated))
  } catch (err) {
    next(err)
  }
}