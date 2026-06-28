import 'dotenv/config'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type Application } from 'express'

import corsConfig from '@/config/cors'
import { httpLogger } from '@/config/logger'
import { setupSwagger } from '@/config/swagger'
import { metricsMiddleware } from '@/middlewares/metrics.middleware.js'
import { errorHandler } from '@/middlewares/error-handler'
import apiRoutes from '@/routes/index'

const app: Application = express()

app.use(cors(corsConfig))

app.use(express.json())

app.use(cookieParser())

// Metric recording — after body parsers, before routes
app.use(metricsMiddleware)

app.use(httpLogger)

// HEALTHCHECK
app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    otel: 'instrumented'
  })
})

setupSwagger(app)

app.use('/api/v1', apiRoutes)

app.use(errorHandler)

export default app
