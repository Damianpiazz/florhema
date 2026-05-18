import { Router } from 'express'

import authRoutes from '../modules/auth/auth.routes'

const apiRouter = Router()

apiRouter.use('/auth', authRoutes)

export default apiRouter
