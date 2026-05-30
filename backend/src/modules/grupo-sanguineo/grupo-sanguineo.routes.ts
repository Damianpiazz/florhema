import { Router } from 'express'

import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { list, update } from '@/modules/grupo-sanguineo/grupo-sanguineo.controller'

const router = Router()

router.get('/', list)

router.put('/:id', authMiddleware, adminMiddleware, update)

export default router
