import 'dotenv/config'

import express, { type Application } from 'express'

const app: Application = express()

// HEALTHCHECK
app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

export default app