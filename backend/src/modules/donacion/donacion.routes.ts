import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { create, list, getById, update } from '@/modules/donacion/donacion.controller'

const router = Router()

router.post('/', authMiddleware, create)
router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, getById)
router.put('/:id', authMiddleware, update)

export default router
