import app from '@/app.js'
import { logger } from '@/config/logger'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on:`)
  logger.info(`- Local:   http://localhost:${PORT}`)
  logger.info(`- Network: http://0.0.0.0:${PORT}`)
})
