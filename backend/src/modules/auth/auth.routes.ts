import { Router } from 'express'

import { authMiddleware } from '@/middlewares/auth.middleware'
import { register, getMe } from '@/modules/auth/auth.controller'

const router = Router()

router.post('/register', register)
router.get('/me', authMiddleware, getMe)

export default router
