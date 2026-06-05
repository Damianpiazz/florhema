import { Router } from 'express'

import { authMiddleware } from '@/middlewares/auth.middleware'
import { list, create } from '@/modules/persona/persona.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.post('/', authMiddleware, create)

export default router