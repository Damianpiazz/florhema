import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { getDashboard } from '@/modules/dashboard/dashboard.controller'

const router = Router()

router.get('/dashboard', authMiddleware, getDashboard)

export default router
