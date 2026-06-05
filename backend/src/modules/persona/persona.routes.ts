import { Router } from 'express'

import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { list, create, update, remove } from '@/modules/persona/persona.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.post('/', authMiddleware, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router