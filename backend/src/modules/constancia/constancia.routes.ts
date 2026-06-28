import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { getConstanciaDonacion, getConstanciaEstudioGestante } from '@/modules/constancia/constancia.controller'

const router = Router()

router.get('/donacion/:donacionId', authMiddleware, getConstanciaDonacion)
router.get('/estudio-gestante/:estudioGestanteId', authMiddleware, getConstanciaEstudioGestante)

export default router
