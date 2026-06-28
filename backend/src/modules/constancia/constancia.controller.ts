import type { Request, Response, NextFunction } from 'express'
import { generarConstanciaDonacion, generarConstanciaEstudioGestante } from '@/modules/constancia/constancia.service'

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
