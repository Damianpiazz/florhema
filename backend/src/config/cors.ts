import type { CorsOptions } from 'cors'

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || []

const corsConfig: CorsOptions = {
  origin(origin, callback) {
    // Permitir requests server-to-server o Postman
    if (!origin) {
      return callback(null, true)
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('CORS not allowed'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}

export default corsConfig