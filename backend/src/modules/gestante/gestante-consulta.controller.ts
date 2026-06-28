import type { Request, Response, NextFunction } from 'express'
import { consultarGestantes } from '@/modules/gestante/gestante-consulta.service'

export async function consultaGestante(req: Request, res: Response, next: NextFunction) {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const data = await consultarGestantes(search)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
