import { Router } from 'express'

import { authMiddleware, adminMiddleware } from '@/middlewares/auth.middleware'
import {
  list,
  create,
  update,
  remove,
  detalle,
  listarDonaciones,
  listarTransfusiones,
  listarEstudios,
  listarRecienNacidos,
  listarActividad,
} from '@/modules/persona/persona.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.get('/:id', authMiddleware, detalle)
router.post('/', authMiddleware, create)
router.put('/:id', authMiddleware, update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)
router.get('/:id/donaciones', authMiddleware, listarDonaciones)
router.get('/:id/transfusiones', authMiddleware, listarTransfusiones)
router.get('/:id/estudios-gestante', authMiddleware, listarEstudios)
router.get('/:id/recien-nacidos', authMiddleware, listarRecienNacidos)
router.get('/:id/actividad', authMiddleware, listarActividad)

export default router