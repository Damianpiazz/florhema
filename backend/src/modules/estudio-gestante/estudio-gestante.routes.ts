import { Router } from 'express'
import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { list, listAll, create, update, remove } from '@/modules/estudio-gestante/estudio-gestante.controller'

const router = Router()

router.get('/', authMiddleware, listAll)
router.get('/gestantes/:gestanteId/estudios', authMiddleware, list)
router.post('/gestantes/:gestanteId/estudios', authMiddleware, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)

export default router
