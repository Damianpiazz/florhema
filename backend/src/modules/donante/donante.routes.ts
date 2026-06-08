import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { list, getById } from '@/modules/donante/donante.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, getById)

export default router
