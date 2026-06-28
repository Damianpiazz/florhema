import { Router } from 'express'

import { authMiddleware, adminMiddleware, roleMiddleware } from '@/middlewares/auth.middleware'
import {
  list,
  create,
  update,
  remove,
  detalle,
  getByDni,
  listarDonaciones,
  listarTransfusiones,
  listarEstudios,
  listarRecienNacidos,
  listarActividad,
} from '@/modules/persona/persona.controller'
import { create as crearGestante } from '@/modules/gestante/gestante.controller'
import { create as crearPaciente } from '@/modules/paciente/paciente.controller'

const router = Router()

router.get('/', authMiddleware, list)
router.get('/dni/:dni', authMiddleware, getByDni)
router.get('/:id', authMiddleware, detalle)
router.post('/', authMiddleware, roleMiddleware('ADMIN', 'USER'), create)
router.put('/:id', authMiddleware, roleMiddleware('ADMIN', 'USER'), update)
router.delete('/:id', authMiddleware, adminMiddleware, remove)
router.get('/:id/donaciones', authMiddleware, listarDonaciones)
router.get('/:id/transfusiones', authMiddleware, listarTransfusiones)
router.get('/:id/estudios-gestante', authMiddleware, listarEstudios)
router.post('/:id/gestante', authMiddleware, roleMiddleware('ADMIN', 'USER'), crearGestante)
router.post('/:id/paciente', authMiddleware, roleMiddleware('ADMIN', 'USER'), crearPaciente)
router.get('/:id/recien-nacidos', authMiddleware, listarRecienNacidos)
router.get('/:id/actividad', authMiddleware, listarActividad)

export default router