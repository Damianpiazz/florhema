import { createHash } from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'

import { AUTH } from '@/config/auth'
import { loginSchema, userResponseSchema } from '@/modules/auth/auth.schema'
import * as authService from '@/modules/auth/auth.service'
import { successResponse } from '@/utils/api-response'

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Iniciar sesión
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
 *                 example: miPassword123
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
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
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: session_token=<token>; HttpOnly; Secure; SameSite=Lax; Path=/
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Email o contraseña incorrectos
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body)
    const { user, tokenRaw } = await authService.login(input)
    const validated = userResponseSchema.parse(user)

    res.cookie(AUTH.COOKIE_NAME, tokenRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH.COOKIE_MAX_AGE_SECONDS * 1000,
      domain: process.env.NODE_ENV !== 'production' ? AUTH.COOKIE_DOMAIN : undefined
    })

    res.status(200).json(successResponse({ user: validated }))
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Obtener usuario autenticado
 *     responses:
 *       200:
 *         description: Usuario autenticado
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
 *       401:
 *         description: No autenticado
 */
/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Cerrar sesión
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: No autenticado
 */
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[AUTH.COOKIE_NAME]
    if (!token) {
      return res.status(401).json(successResponse({ message: 'No autenticado' }))
    }

    const tokenHash = createHash('sha256').update(token).digest('hex')
    await authService.logout(tokenHash)

    res.status(200).json(successResponse({ message: 'Sesión cerrada exitosamente' }))
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json(successResponse({ user: null }))
    }
    const validated = userResponseSchema.parse(user)
    res.status(200).json(successResponse({ user: validated }))
  } catch (err) {
    next(err)
  }
}
