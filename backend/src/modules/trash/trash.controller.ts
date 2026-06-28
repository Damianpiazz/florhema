import type { Request, Response, NextFunction } from 'express'
import { trashParamsSchema, trashQuerySchema } from './trash.schema'
import { getTrashItems, restoreItem } from './trash.service'

/**
 * @openapi
 * /api/v1/admin/trash:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Listar elementos eliminados (soft-delete)
 *     description: Retorna todos los registros soft-deleteados con paginación. Solo ADMIN.
 *     security:
 *       - cookieAuth: []
 *     parameters:
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
 *         description: Lista paginada de elementos eliminados
 *       403:
 *         description: No autorizado (requiere ADMIN)
 */
export async function listTrash(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, pageSize, search, entityType, fechaDesde, fechaHasta } = trashQuerySchema.parse(req.query)
    const result = await getTrashItems(page, pageSize, { search, entityType, fechaDesde, fechaHasta })
    res.json(result)
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/admin/trash/{entityType}/{id}/restore:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Restaurar un elemento eliminado
 *     description: Setea deletedAt = null para el registro especificado. Solo ADMIN.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [persona, donante, paciente, gestante, donacion, transfusion, user]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Elemento restaurado
 *       403:
 *         description: No autorizado (requiere ADMIN)
 *       404:
 *         description: Entidad o ID inválido
 */
export async function restoreTrashItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { entityType, id } = trashParamsSchema.parse(req.params)
    await restoreItem(entityType, id)
    res.json({ restored: true, entityType, id })
  } catch (err) {
    next(err)
  }
}
