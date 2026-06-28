import type { Request, Response, NextFunction } from 'express'
import { generarConstanciaDonacion, generarConstanciaEstudioGestante } from '@/modules/constancia/constancia.service'

/**
 * @openapi
 * /api/v1/constancias/donacion/{donacionId}:
 *   get:
 *     tags:
 *       - Constancias
 *     summary: Obtener constancia de donación (PDF)
 *     description: Genera y retorna un PDF con la constancia de una donación. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: donacionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la donación
 *     responses:
 *       200:
 *         description: PDF de la constancia de donación
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Donación no encontrada
 */
export async function getConstanciaDonacion(req: Request, res: Response, next: NextFunction) {
  try {
    const donacionId = Number(req.params.donacionId)
    const pdf = await generarConstanciaDonacion(donacionId)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="constancia-donacion-${donacionId}.pdf"`)
    res.send(pdf)
  } catch (err) {
    next(err)
  }
}

/**
 * @openapi
 * /api/v1/constancias/estudio-gestante/{estudioGestanteId}:
 *   get:
 *     tags:
 *       - Constancias
 *     summary: Obtener constancia de estudio de gestante (PDF)
 *     description: Genera y retorna un PDF con la constancia de un estudio de gestante. Requiere autenticación.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: estudioGestanteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudio de gestante
 *     responses:
 *       200:
 *         description: PDF de la constancia de estudio de gestante
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Estudio de gestante no encontrado
 */
export async function getConstanciaEstudioGestante(req: Request, res: Response, next: NextFunction) {
  try {
    const estudioGestanteId = Number(req.params.estudioGestanteId)
    const pdf = await generarConstanciaEstudioGestante(estudioGestanteId)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="constancia-estudio-gestante-${estudioGestanteId}.pdf"`)
    res.send(pdf)
  } catch (err) {
    next(err)
  }
}
