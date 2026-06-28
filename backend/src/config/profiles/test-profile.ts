import { env } from '@/config/env'

/**
 * Test profile — loaded automatically when NODE_ENV=test.
 *
 * - OTEL disabled (not needed in tests)
 * - Silent logging to avoid noise
 * - Minimum bcrypt rounds for speed
 * - Random port (let the OS assign one)
 */
export const testProfile = {
  otel: {
    enabled: false,
    collectorHost: undefined,
  } as const,

  logging: {
    level: 'silent' as const,
    pretty: false,
  },

  cors: {
    origins: env.CORS_ORIGINS || 'http://localhost:3000',
  },

  auth: {
    saltRounds: 4,
    sessionDurationHours: 1,
  },
}
