import { Router } from 'express'

import authRoutes from '../modules/auth/auth.routes'

import grupoSanguineoRoutes from '../modules/grupo-sanguineo/grupo-sanguineo.routes'

import personaRoutes from '../modules/persona/persona.routes'
import donanteRoutes from '../modules/donante/donante.routes'
import donacionRoutes from '../modules/donacion/donacion.routes'
import transfusionRoutes from '../modules/transfusion/transfusion.routes'
import gestanteRoutes from '../modules/gestante/gestante.routes'
import estudioGestanteRoutes from '../modules/estudio-gestante/estudio-gestante.routes'
import recienNacidoRoutes from '../modules/recien-nacido/recien-nacido.routes'
import pacienteRoutes from '../modules/paciente/paciente.routes'
import constanciaRoutes from '../modules/constancia/constancia.routes'
import reporteRoutes from '../modules/reporte/reporte.routes'
import usuariosRoutes from '../modules/usuarios/usuarios.routes'
import auditRoutes from '../modules/audit/audit.routes'
import dashboardRoutes from '../modules/dashboard/dashboard.routes'

const apiRouter = Router()

apiRouter.use('/auth', authRoutes)

apiRouter.use('/grupos-sanguineos', grupoSanguineoRoutes)

apiRouter.use('/personas', personaRoutes)

apiRouter.use('/donantes', donanteRoutes)

apiRouter.use('/donaciones', donacionRoutes)

apiRouter.use('/transfusiones', transfusionRoutes)

apiRouter.use('/gestantes', gestanteRoutes)

apiRouter.use('/estudios-gestante', estudioGestanteRoutes)

apiRouter.use('/recien-nacidos', recienNacidoRoutes)

apiRouter.use('/pacientes', pacienteRoutes)

apiRouter.use('/constancias', constanciaRoutes)
apiRouter.use('/reportes', reporteRoutes)
apiRouter.use('/reportes', dashboardRoutes)
apiRouter.use('/usuarios', usuariosRoutes)
apiRouter.use('/audit', auditRoutes)

export default apiRouter
