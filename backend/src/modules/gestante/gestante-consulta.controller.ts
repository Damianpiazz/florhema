import type { Request, Response, NextFunction } from 'express'
import { consultarEstudios } from '@/modules/gestante/gestante-consulta.service'

/**
 * @openapi
 * /api/v1/gestantes/consulta:
 *   get:
 *     tags:
 *       - Gestantes
 *     summary: Buscar estudios de gestantes
 *     description: Retorna estudios de gestantes con paginación. Filtra por DNI, nombre o apellido de la paciente. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista paginada de estudios
 *       401:
 *         description: No autenticado
 */
export async function consultaGestante(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const page = Math.max(1, parseInt(req.query.page as string) || 1)
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 20))
    const data = await consultarEstudios(search, page, pageSize)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
