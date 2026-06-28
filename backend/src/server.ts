// IMPORTANT: instrumentation MUST be imported before any other module so that
// auto-instrumentations can patch modules (Express, etc.) on load.
import './instrumentation.js'

import app from '@/app.js'
import { logger } from '@/config/logger'
import { shutdownSdk } from './instrumentation.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on:`)
  logger.info(`- Local:   http://localhost:${PORT}`)
  logger.info(`- Network: http://0.0.0.0:${PORT}`)
})

const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`)

  server.close(() => {
    logger.info('HTTP server closed')
  })

  await shutdownSdk()
  logger.info('OTEL SDK shut down successfully')
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
