import type { Request, Response, NextFunction } from 'express'
import { consultarGestantes } from '@/modules/gestante/gestante-consulta.service'

/**
 * @openapi
 * /api/v1/gestantes/consulta:
 *   get:
 *     tags:
 *       - Gestantes
 *     summary: Buscar gestantes
 *     description: Busca gestantes por DNI, nombre o apellido. Retorna hasta 20 resultados con su último estudio y grupo sanguíneo. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (coincide con DNI, nombre o apellido)
 *     responses:
 *       200:
 *         description: Lista de gestantes encontradas
 *       401:
 *         description: No autenticado
 */
export async function consultaGestante(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const data = await consultarGestantes(search)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
