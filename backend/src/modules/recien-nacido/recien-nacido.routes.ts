import { Router } from 'express'
import { authMiddleware, adminMiddleware, roleMiddleware } from '@/middlewares/auth.middleware'
import { list, create, getById, update, remove } from '@/modules/recien-nacido/recien-nacido.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, getById)
router.post('/gestantes/:gestanteId/recien-nacidos', authMiddleware, roleMiddleware('ADMIN', 'USER'), create)
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'USER'), update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router
