import { env } from '@/config/env'

/**
 * Production profile — loaded automatically when NODE_ENV=production.
 *
 * - OTEL enabled (expects otel-collector on the Docker network)
 * - Info logging, no pretty-print (structured JSON for log aggregation)
 * - Strict CORS (must be set via env)
 * - Higher bcrypt rounds for security
 */
export const prodProfile = {
  otel: {
    enabled: env.OTEL_ENABLED,
    collectorHost: env.OTEL_COLLECTOR_HOST || 'otel-collector',
    serviceName: env.OTEL_SERVICE_NAME,
    protocol: env.OTEL_EXPORTER_OTLP_PROTOCOL,
  } as const,

  logging: {
    level: 'info' as const,
    pretty: false,
  },

  cors: {
    origins: env.CORS_ORIGINS,
  },

  auth: {
    saltRounds: Math.max(env.AUTH_SALT_ROUNDS, 12),
    sessionDurationHours: env.AUTH_SESSION_DURATION_HOURS,
  },
}
