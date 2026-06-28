import { Router } from 'express'
import { authMiddleware } from '@/middlewares/auth.middleware'
import { list, getById, getByDni, calcular } from '@/modules/donante/donante.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.get('/dni/:dni', authMiddleware, getByDni)
router.get('/:id', authMiddleware, getById)
router.post('/:id/calcular-semaforo', authMiddleware, calcular)

export default router
