import 'dotenv/config'
import express, { type Application } from 'express'
import cors from 'cors'
import corsConfig from '@/config/cors'
import apiRoutes from '@/routes/index'
import { setupSwagger } from '@/config/swagger'
import { errorHandler } from '@/middlewares/error-handler'

const app: Application = express()

app.use(cors(corsConfig))

app.use(express.json())

// HEALTHCHECK
app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

setupSwagger(app)

app.use('/api/v1', apiRoutes)

app.use(errorHandler)

export default app