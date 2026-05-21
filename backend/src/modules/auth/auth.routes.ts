import { Router } from 'express'

import { authMiddleware } from '@/middlewares/auth.middleware'
import { login, logout, getMe } from '@/modules/auth/auth.controller'

const router = Router()

router.post('/login', login)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, getMe)

export default router
