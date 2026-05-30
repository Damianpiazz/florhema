import { Router } from 'express'

import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { list, update, remove } from '@/modules/grupo-sanguineo/grupo-sanguineo.controller'

const router = Router()

router.get('/', list)

router.put('/:id', authMiddleware, adminMiddleware, update)

router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router
