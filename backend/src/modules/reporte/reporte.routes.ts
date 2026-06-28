import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { getReporteHemo } from '@/modules/reporte/reporte.controller'

const router = Router()

router.get('/hemo', authMiddleware, getReporteHemo)

export default router
