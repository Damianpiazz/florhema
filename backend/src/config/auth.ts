export const AUTH = {
  SALT_ROUNDS: Number(process.env.AUTH_SALT_ROUNDS) || 10,
  SESSION_DURATION_MS: (Number(process.env.AUTH_SESSION_DURATION_HOURS) || 24) * 60 * 60 * 1000,
  TOKEN_BYTES: 48,
  COOKIE_NAME: 'session_token',
  get COOKIE_MAX_AGE_SECONDS() {
    return Math.floor(this.SESSION_DURATION_MS / 1000)
  },
  COOKIE_DOMAIN: 'localhost'
} as const
