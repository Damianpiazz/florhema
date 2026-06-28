import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { listar } from './audit.controller'

const router = Router()
router.use(authMiddleware, adminMiddleware)
router.get('/', listar)
export default router
