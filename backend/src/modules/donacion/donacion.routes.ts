import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { create, list, getById } from '@/modules/donacion/donacion.controller'

const router = Router()

router.post('/', authMiddleware, create)
router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, getById)

export default router
