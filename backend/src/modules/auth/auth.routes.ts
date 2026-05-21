import { Router } from 'express'

import { authMiddleware } from '@/middlewares/auth.middleware'
import { login, getMe } from '@/modules/auth/auth.controller'

const router = Router()

router.post('/login', login)
router.get('/me', authMiddleware, getMe)

export default router
