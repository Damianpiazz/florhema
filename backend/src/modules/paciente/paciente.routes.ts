import { Router } from 'express'
import { authMiddleware, adminMiddleware, roleMiddleware } from '@/middlewares/auth.middleware'
import { list, update, remove } from '@/modules/paciente/paciente.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'USER'), update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router
