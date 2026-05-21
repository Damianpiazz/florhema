import { loginResponseSchema } from './auth.schema'
import type { User } from './auth.schema'

export function parseLoginResponse(data: unknown): User {
  return loginResponseSchema.parse(data).data.user
}
