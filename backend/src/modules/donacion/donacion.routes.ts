import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { create, list, getById, update, remove } from '@/modules/donacion/donacion.controller'

const router = Router()

router.post('/', authMiddleware, create)
router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, getById)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router
