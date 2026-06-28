import { Router } from 'express'
import { authMiddleware, adminMiddleware, roleMiddleware } from '@/middlewares/auth.middleware'
import { list, update, remove } from '@/modules/gestante/gestante.controller'
import { consultaGestante } from '@/modules/gestante/gestante-consulta.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'USER'), update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)
router.get('/consulta', authMiddleware, consultaGestante)

export default router
