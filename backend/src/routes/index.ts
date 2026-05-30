import { Router } from 'express'

import authRoutes from '../modules/auth/auth.routes'

import grupoSanguineoRoutes from '../modules/grupo-sanguineo/grupo-sanguineo.routes'

import personaRoutes from '../modules/persona/persona.routes'

const apiRouter = Router()

apiRouter.use('/auth', authRoutes)

apiRouter.use('/grupos-sanguineos', grupoSanguineoRoutes)

apiRouter.use('/personas', personaRoutes)


export default apiRouter
