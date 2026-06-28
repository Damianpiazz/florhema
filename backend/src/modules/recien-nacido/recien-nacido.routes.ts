import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { list, create, getById, update, remove } from '@/modules/recien-nacido/recien-nacido.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, getById)
router.post('/gestantes/:gestanteId/recien-nacidos', authMiddleware, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router
