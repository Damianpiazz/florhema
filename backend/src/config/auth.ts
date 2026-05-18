export const AUTH = {
  SALT_ROUNDS: Number(process.env.AUTH_SALT_ROUNDS) || 10,
  SESSION_DURATION_MS: (Number(process.env.AUTH_SESSION_DURATION_HOURS) || 24) * 60 * 60 * 1000,
  TOKEN_BYTES: 48
} as const
