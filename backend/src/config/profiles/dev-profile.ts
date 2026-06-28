import { env } from '@/config/env'

/**
 * Development profile — loaded automatically when NODE_ENV=development.
 *
 * - OTEL disabled (no collector running locally)
 * - Debug logging with pino-pretty
 * - Relaxed CORS for localhost
 * - Fast bcrypt rounds for quick restarts
 */
export const devProfile = {
  otel: {
    enabled: false,
    collectorHost: undefined,
  } as const,

  logging: {
    level: 'debug' as const,
    pretty: true,
  },

  cors: {
    origins: env.CORS_ORIGINS || 'http://localhost:3000',
  },

  auth: {
    saltRounds: Math.min(env.AUTH_SALT_ROUNDS, 10),
    sessionDurationHours: env.AUTH_SESSION_DURATION_HOURS,
  },
}
