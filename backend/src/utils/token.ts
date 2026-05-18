import { randomBytes, createHash } from 'node:crypto'

import { AUTH } from '@/config/auth'

export interface GeneratedToken {
  raw: string
  hash: string
}

export function generateSessionToken(): GeneratedToken {
  const raw = randomBytes(AUTH.TOKEN_BYTES).toString('hex')
  const hash = createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}
