import { generateSessionToken } from '@/utils/token'
import { AUTH } from '@/config/auth'
import * as sessionRepository from '@/modules/auth/session.repository'

export async function createSession(userId: number) {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + AUTH.SESSION_DURATION_MS)
  await sessionRepository.create(userId, token.hash, expiresAt)
  return { tokenRaw: token.raw }
}