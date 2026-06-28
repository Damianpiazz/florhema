import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  // =========================
  // APP
  // =========================
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(4000),

  AUTH_SALT_ROUNDS: z.coerce.number().int().min(1).max(20).default(10),

  AUTH_SESSION_DURATION_HOURS: z.coerce.number().int().positive().default(24),

  // =========================
  // FRONTEND
  // =========================
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // =========================
  // DATABASE
  // =========================
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL debe ser una URL válida')
    .refine((s) => s.startsWith('postgresql://'), {
      message: 'DATABASE_URL debe comenzar con postgresql://',
    }),

  // =========================
  // OBSERVABILITY
  // =========================
  OTEL_ENABLED: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  OTEL_COLLECTOR_HOST: z.string().default('localhost'),

  OTEL_SERVICE_NAME: z.string().default('florhema-api'),

  OTEL_EXPORTER_OTLP_PROTOCOL: z
    .enum(['http/protobuf', 'grpc'])
    .default('http/protobuf'),

  // =========================
  // LOGGING
  // =========================
  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error', 'silent'])
    .default('debug'),
})

export type Env = z.infer<typeof envSchema>

let _env: Env | null = null

/**
 * Validates `process.env` against the schema and returns a typed, frozen object.
 * Call once at the very start of the app (after dotenv) so every other module
 * can import `env` safely.
 *
 * On failure it prints every invalid field and exits the process.
 */
export function validateEnv(): Env {
  if (_env) return _env

  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error('')
    console.error('❌  Variables de entorno inválidas:')
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      console.error(`    • ${path}: ${issue.message}`)
      if (issue.code === 'invalid_union') {
        const details = (issue as { errors: z.ZodIssue[][] }).errors
        for (const subIssues of details) {
          for (const sub of subIssues) {
            console.error(`        → ${sub.message}`)
          }
        }
      }
    }
    console.error('')
    process.exit(1)
  }

  _env = Object.freeze(result.data) as Env
  return _env
}

// Eager validation at import time — dotenv was loaded above.
export const env = validateEnv()
