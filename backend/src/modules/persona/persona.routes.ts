import { Router } from 'express'

import { authMiddleware } from '@/middlewares/auth.middleware'
import { list } from '@/modules/persona/persona.controller'

const router = Router()

router.get('/', authMiddleware, list)

export default router