import { Router } from 'express'
import { authMiddleware, adminMiddleware, roleMiddleware } from '@/middlewares/auth.middleware'
import { create, list, getById, update, remove } from '@/modules/donacion/donacion.controller'

const router = Router()

router.post('/', authMiddleware, roleMiddleware('ADMIN', 'USER'), create)
router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, getById)
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'USER'), update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router
