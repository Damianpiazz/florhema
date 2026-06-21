import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { list, getById, getByDni } from '@/modules/donante/donante.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.get('/dni/:dni', authMiddleware, getByDni)
router.get('/:id', authMiddleware, getById)

export default router
