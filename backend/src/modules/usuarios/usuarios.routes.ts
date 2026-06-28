import { Router } from 'express'

import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import { listar, crear, actualizar, eliminar } from './usuarios.controller'

const router = Router()

router.use(authMiddleware, adminMiddleware)

router.get('/', listar)
router.post('/', crear)
router.patch('/:id', actualizar)
router.delete('/:id', eliminar)

export default router
