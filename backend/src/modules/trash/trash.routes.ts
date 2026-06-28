import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { listTrash, restoreTrashItem } from './trash.controller'

const router = Router()

router.get('/trash', authMiddleware, adminMiddleware, listTrash)
router.post('/trash/:entityType/:id/restore', authMiddleware, adminMiddleware, restoreTrashItem)

export default router
